import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { ChatServiceApi } from "@/modules/chat/service/ChatServiceApi";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roomId = parseInt(params.roomId);
    if (isNaN(roomId)) {
      return NextResponse.json({ error: "Invalid room ID" }, { status: 400 });
    }

    const chatService = new ChatServiceApi();
    const messages = await chatService.listMessages(roomId, {
      page: 1,
      limit: 50,
    });

    return NextResponse.json({ data: messages });
  } catch (error) {
    console.error("Chat Messages API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roomId = parseInt(params.roomId);
    if (isNaN(roomId)) {
      return NextResponse.json({ error: "Invalid room ID" }, { status: 400 });
    }

    const body = await request.json();
    const chatService = new ChatServiceApi();
    const message = await chatService.createMessage(roomId, body, context);

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Chat Message Creation API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
