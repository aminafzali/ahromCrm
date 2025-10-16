import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { NextRequest, NextResponse } from "next/server";
import { InternalChatServiceApi } from "../../service/InternalChatServiceApi";

const service = new InternalChatServiceApi();

/**
 * Get admin workspace users and teams for internal chat
 */
export async function GET(req: NextRequest) {
  console.log("🔄 [Internal Chat API] GET /api/internal-chat/contacts");
  try {
    const context = await AuthProvider.isAuthenticated(req);
    console.log("✅ [Internal Chat API] Auth context:", {
      userId: context.user?.id,
      workspaceId: context.workspaceId,
      workspaceUserId: context.workspaceUser?.id,
      role: context.workspaceUser?.role?.name,
    });

    // Get both users and teams in parallel
    const [users, teams] = await Promise.all([
      service.getAdminWorkspaceUsers(context),
      service.getUserTeams(context),
    ]);

    console.log("✅ [Internal Chat API] Data retrieved:", {
      usersCount: users?.length || 0,
      teamsCount: teams?.length || 0,
    });

    return NextResponse.json({
      users,
      teams,
    });
  } catch (error: any) {
    console.error("❌ [Internal Chat API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}
