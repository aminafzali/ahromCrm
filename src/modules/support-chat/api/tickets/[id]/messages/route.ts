import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { NextRequest, NextResponse } from "next/server";
import { SupportChatServiceApi } from "../../../../service/SupportChatServiceApi";

const service = new SupportChatServiceApi();

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

/**
 * Get ticket messages
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await AuthProvider.isAuthenticated(req);
    const ticketId = parseInt(params.id);

    const url = new URL(req.url);
    const queryParams = {
      page: parseInt(url.searchParams.get("page") || "1"),
      limit: parseInt(url.searchParams.get("limit") || "50"),
    };

    const messages = await service.getTicketMessages(
      ticketId,
      queryParams,
      context
    );
    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}

/**
 * Send message to ticket
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await AuthProvider.isAuthenticated(req);
    const ticketId = parseInt(params.id);
    const body = await req.json();

    const message = await service.sendMessage(ticketId, body, context);
    return NextResponse.json(message);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}

// Edit message
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await AuthProvider.isAuthenticated(req);
    const ticketId = parseInt(params.id);
    const body = await req.json();
    const { messageId, text } = body || {};
    if (!messageId || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const service = new SupportChatServiceApi();
    const updated = await service.editMessage(
      ticketId,
      messageId,
      { body: text },
      context
    );
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}

// Delete message (soft)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await AuthProvider.isAuthenticated(req);
    const ticketId = parseInt(params.id);
    const url = new URL(req.url);
    const messageId = parseInt(url.searchParams.get("messageId") || "0");
    if (!messageId) {
      return NextResponse.json(
        { error: "messageId required" },
        { status: 400 }
      );
    }
    const service = new SupportChatServiceApi();
    const updated = await service.deleteMessage(ticketId, messageId, context);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}
