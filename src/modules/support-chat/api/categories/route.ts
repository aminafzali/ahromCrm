import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { NextRequest, NextResponse } from "next/server";
import { SupportChatServiceApi } from "../../service/SupportChatServiceApi";

const service = new SupportChatServiceApi();

/**
 * Get support categories
 */
export async function GET(req: NextRequest) {
  try {
    // Try to get authenticated context, but don't fail if not authenticated
    let context;
    try {
      context = await AuthProvider.isAuthenticated(req);
    } catch (authError) {
      // If not authenticated, create a minimal context for public access
      const url = new URL(req.url);
      const workspaceSlug = url.searchParams.get("workspaceSlug");

      if (!workspaceSlug) {
        return NextResponse.json(
          { error: "Workspace slug is required" },
          { status: 400 }
        );
      }

      // Create minimal context for public access
      context = {
        workspaceSlug,
        isPublic: true,
      };
    }

    const categories = await service.getCategories(context);
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("❌ [Support Chat Categories] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}
