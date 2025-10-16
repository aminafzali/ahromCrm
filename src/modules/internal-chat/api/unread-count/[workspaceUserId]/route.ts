import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { NextRequest, NextResponse } from "next/server";
import { InternalChatServiceApi } from "../../../service/InternalChatServiceApi";

/**
 * GET /api/internal-chat/unread-count/[workspaceUserId]
 * Get unread message count for a specific workspace user
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { workspaceUserId: string } }
) {
  try {
    const workspaceUserId = parseInt(params.workspaceUserId, 10);

    if (isNaN(workspaceUserId)) {
      return NextResponse.json(
        { error: "Invalid workspace user ID" },
        { status: 400 }
      );
    }

    const context = await AuthProvider.isAuthenticated(req);
    const service = new InternalChatServiceApi();
    const result = await service.getUnreadCount({ workspaceUserId }, context);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error getting unread count:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get unread count" },
      { status: 500 }
    );
  }
}
