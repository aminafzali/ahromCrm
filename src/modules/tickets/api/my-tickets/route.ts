import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { NextRequest, NextResponse } from "next/server";
import { TicketsServiceApi } from "../../service/TicketsServiceApi";

const service = new TicketsServiceApi();

export async function GET(req: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(req);
    if (!context.workspaceId || !context.workspaceUser) {
      return NextResponse.json(
        { error: "کاربر وارد نشده است" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const params = {
      page: parseInt(url.searchParams.get("page") || "1"),
      limit: parseInt(url.searchParams.get("limit") || "20"),
      status: url.searchParams.get("status") || undefined,
      priority: url.searchParams.get("priority") || undefined,
    };

    const tickets = await service.getMyTickets(params, context);
    return NextResponse.json(tickets);
  } catch (error: any) {
    console.error("Error in my-tickets GET:", error);
    return NextResponse.json(
      { error: error.message || "خطا در دریافت تیکت‌های من" },
      { status: 500 }
    );
  }
}
