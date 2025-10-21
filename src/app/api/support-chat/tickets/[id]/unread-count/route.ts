import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { SupportChatServiceApi } from "@/modules/support-chat/service/SupportChatServiceApi";
import { NextRequest, NextResponse } from "next/server";

const service = new SupportChatServiceApi();

/**
 * Get unread message count for a specific ticket
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await AuthProvider.isAuthenticated(req);
    const ticketId = parseInt(params.id);

    if (isNaN(ticketId)) {
      return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });
    }

    const unreadCount = await service.getUnreadMessageCount(ticketId, context);

    return NextResponse.json({ count: unreadCount });
  } catch (error: any) {
    console.error(`Error getting unread count for ticket ${params.id}:`, error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}

