import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { NextRequest, NextResponse } from "next/server";
import { InternalChatServiceApi } from "../../service/InternalChatServiceApi";

const service = new InternalChatServiceApi();

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
 * Get messages for a room
 */
export async function GET(req: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(req);

    const url = new URL(req.url);
    const roomId = parseInt(url.searchParams.get("roomId") || "0");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "50");

    if (!roomId) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    const messages = await service.getRoomMessages(
      roomId,
      { page, limit },
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
 * Send a message to a room
 */
export async function POST(req: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(req);
    const body = await req.json();
    const { roomId, ...messageData } = body;

    if (!roomId) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    const message = await service.sendMessage(roomId, messageData, context);
    return NextResponse.json(message);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}

// Edit message
export async function PATCH(req: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(req);
    const body = await req.json();
    const { messageId, text } = body || {};
    if (!messageId || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const service = new InternalChatServiceApi();
    const updated = await (service as any).editMessage(
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
export async function DELETE(req: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(req);
    const url = new URL(req.url);
    const messageId = parseInt(url.searchParams.get("messageId") || "0");
    if (!messageId) {
      return NextResponse.json(
        { error: "messageId required" },
        { status: 400 }
      );
    }
    const service = new InternalChatServiceApi();
    const updated = await (service as any).deleteMessage(messageId, context);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}
