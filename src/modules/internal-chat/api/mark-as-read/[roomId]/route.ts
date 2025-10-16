import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { NextRequest, NextResponse } from "next/server";
import { InternalChatServiceApi } from "../../../service/InternalChatServiceApi";

/**
 * POST /api/internal-chat/mark-as-read/[roomId]
 * Mark all messages in a room as read
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const roomId = parseInt(params.roomId, 10);

    if (isNaN(roomId)) {
      return NextResponse.json({ error: "Invalid room ID" }, { status: 400 });
    }

    const context = await AuthProvider.isAuthenticated(req);
    const service = new InternalChatServiceApi();
    const result = await service.markAsRead({ roomId }, context);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error marking as read:", error);
    return NextResponse.json(
      { error: error.message || "Failed to mark as read" },
      { status: 500 }
    );
  }
}
