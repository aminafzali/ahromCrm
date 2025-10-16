import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { NextRequest, NextResponse } from "next/server";
import { SupportChatServiceApi } from "../../service/SupportChatServiceApi";

const service = new SupportChatServiceApi();

/**
 * Get support labels
 */
export async function GET(req: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(req);
    const labels = await service.getLabels(context);
    return NextResponse.json(labels);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}
