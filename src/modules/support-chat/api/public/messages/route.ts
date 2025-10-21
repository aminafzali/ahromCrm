import { NextRequest, NextResponse } from "next/server";
import { RateLimitService } from "../../../services/RateLimitService";

// Helper function to determine user type from request
function getUserInfoFromRequest(request: NextRequest, body?: any) {
  const cookieStore = request.cookies;

  // Get guest info from cookies (for guest users)
  const guestId = cookieStore.get("support_guest_id")?.value;

  // For registered users, we need to get info from request body
  // since we don't use cookies for workspace info
  const workspaceUserId = body?.workspaceUserId;
  const workspaceId = body?.workspaceId;

  if (workspaceUserId && workspaceId) {
    return {
      type: "registered" as const,
      workspaceUserId: parseInt(workspaceUserId),
      workspaceId: parseInt(workspaceId),
    };
  } else if (guestId) {
    return {
      type: "guest" as const,
      guestId: parseInt(guestId),
    };
  }

  return {
    type: "anonymous" as const,
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "GET, POST, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(request: NextRequest) {
  const { prisma } = await import("@/lib/prisma");
  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get("ticketId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    console.log(
      `🔍 [API] GET /api/support-chat/public/messages?ticketId=${ticketId}&page=${page}&limit=${limit}`
    );

    if (!ticketId) {
      return NextResponse.json(
        { error: "Ticket ID is required" },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // Get messages with pagination - get latest messages first
    const messages = await prisma.supportChatMessage.findMany({
      where: {
        ticketId: parseInt(ticketId),
        isVisible: true,
      },
      orderBy: {
        createdAt: "asc", // Changed back to "asc" for proper chronological order
      },
      skip,
      take: limit,
      include: {
        supportAgent: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        guestUser: {
          select: {
            id: true,
            name: true,
          },
        },
        workspaceUser: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Get total count for pagination
    const totalCount = await prisma.supportChatMessage.count({
      where: {
        ticketId: parseInt(ticketId),
        isVisible: true,
      },
    });

    const hasMore = skip + limit < totalCount;

    console.log(
      `✅ [API] Found ${
        messages.length
      } messages for ticket ${ticketId} (page ${page}/${Math.ceil(
        totalCount / limit
      )}, total: ${totalCount}, hasMore: ${hasMore})`
    );

    // Create sender objects for frontend
    const messagesWithSender = messages.map((message) => ({
      ...message,
      sender: message.supportAgent
        ? {
            name: message.supportAgent.user.name,
            type: "support" as const,
          }
        : message.workspaceUser
        ? {
            name: message.workspaceUser.user.name,
            type: "registered" as const,
            workspaceUserId: message.workspaceUser.id,
          }
        : message.guestUser
        ? {
            name: message.guestUser.name,
            type: "guest" as const,
            guestId: message.guestUser.id,
          }
        : undefined,
    }));

    const response = {
      messages: messagesWithSender, // Keep newest first for proper pagination
      pagination: {
        page,
        limit,
        totalCount,
        hasMore,
        totalPages: Math.ceil(totalCount / limit),
      },
    };

    console.log(
      `📤 [API] Sending response for ticket ${ticketId}: ${
        messagesWithSender.length
      } messages, pagination: ${JSON.stringify(response.pagination)}`
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { prisma } = await import("@/lib/prisma");
  try {
    const body = await request.json();
    const { ticketId, body: messageBody, messageType = "TEXT" } = body;

    if (!ticketId || !messageBody) {
      return NextResponse.json(
        { error: "Ticket ID and message body are required" },
        { status: 400 }
      );
    }

    // Get current user info from request
    const currentUser = getUserInfoFromRequest(request, body);

    // Check rate limiting
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userId =
      currentUser.type === "registered"
        ? `registered_${currentUser.workspaceUserId}`
        : currentUser.type === "guest"
        ? `guest_${currentUser.guestId}`
        : `anonymous_${clientIP}`;

    if (!RateLimitService.canSendMessage(userId)) {
      const status = RateLimitService.getRateLimitStatus(userId);
      return NextResponse.json(
        {
          error:
            "Rate limit exceeded. Please wait before sending another message.",
          remaining: status.remaining,
          timeUntilReset: status.timeUntilReset,
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(status.timeUntilReset / 1000).toString(),
          },
        }
      );
    }

    // Get ticket to verify access
    const ticket = await prisma.supportChatTicket.findUnique({
      where: { id: parseInt(ticketId) },
      include: {
        workspaceUser: true,
        guestUser: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Verify user has access to this ticket
    if (currentUser.type === "registered") {
      if (ticket.workspaceUserId !== currentUser.workspaceUserId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    } else if (currentUser.type === "guest") {
      if (ticket.guestUserId !== currentUser.guestId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    } else {
      // Anonymous users can only access guest tickets
      if (!ticket.guestUserId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    // Create message with correct sender info
    const message = await prisma.supportChatMessage.create({
      data: {
        ticketId: parseInt(ticketId),
        body: messageBody,
        messageType,
        isInternal: false,
        isVisible: true,
        workspaceUserId:
          currentUser.type === "registered"
            ? currentUser.workspaceUserId
            : null,
        guestUserId:
          currentUser.type === "guest"
            ? currentUser.guestId
            : ticket.guestUserId,
      },
      include: {
        supportAgent: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        guestUser: {
          select: {
            id: true,
            name: true,
          },
        },
        workspaceUser: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Create sender object for frontend
    const responseMessage = {
      ...message,
      sender: message.supportAgent
        ? {
            name: message.supportAgent.user.name,
            type: "support" as const,
          }
        : message.workspaceUser
        ? {
            name: message.workspaceUser.user.name,
            type: "registered" as const,
            workspaceUserId: message.workspaceUser.id,
          }
        : message.guestUser
        ? {
            name: message.guestUser.name,
            type: "guest" as const,
            guestId: message.guestUser.id,
          }
        : undefined,
    };

    return NextResponse.json(responseMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json(
    { error: "PATCH not implemented for public messages" },
    { status: 501 }
  );
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { error: "DELETE not implemented for public messages" },
    { status: 501 }
  );
}
