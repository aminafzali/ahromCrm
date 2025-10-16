import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { NextRequest, NextResponse } from "next/server";
import { SupportChatServiceApi } from "../../service/SupportChatServiceApi";

const service = new SupportChatServiceApi();

/**
 * Get support categories
 */
export async function GET(req: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(req);
    const categories = await service.getCategories(context);
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}

