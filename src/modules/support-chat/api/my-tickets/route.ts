import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { NextRequest, NextResponse } from "next/server";
import { SupportChatServiceApi } from "../../service/SupportChatServiceApi";

const service = new SupportChatServiceApi();

/**
 * Get customer's own tickets
 */
export async function GET(req: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(req);
    
    const url = new URL(req.url);
    const params = {
      page: parseInt(url.searchParams.get("page") || "1"),
      limit: parseInt(url.searchParams.get("limit") || "20"),
    };

    const tickets = await service.getMyTickets(params, context);
    return NextResponse.json(tickets);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}

