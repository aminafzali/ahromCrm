import { NextRequest, NextResponse } from "next/server";

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

    if (!ticketId) {
      return NextResponse.json(
        { error: "Ticket ID is required" },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // Get messages with pagination
    const messages = await prisma.supportChatMessage.findMany({
      where: {
        ticketId: parseInt(ticketId),
        isVisible: true,
      },
      orderBy: {
        createdAt: "desc",
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

    return NextResponse.json({
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        totalCount,
        hasMore,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "POST not implemented for public messages" },
    { status: 501 }
  );
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
