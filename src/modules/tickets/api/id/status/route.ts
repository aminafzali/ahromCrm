import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { NextRequest, NextResponse } from "next/server";
import { TicketsServiceApi } from "../../../service/TicketsServiceApi";

const service = new TicketsServiceApi();

export async function PATCH(req: NextRequest, id: number) {
  try {
    const context = await AuthProvider.isAuthenticated(req);
    if (!context.workspaceId || !context.workspaceUser) {
      return NextResponse.json(
        { error: "کاربر وارد نشده است" },
        { status: 401 }
      );
    }

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "شناسه تیکت نامعتبر است" },
        { status: 400 }
      );
    }

    const { status } = await req.json();
    if (!status) {
      return NextResponse.json({ error: "وضعیت الزامی است" }, { status: 400 });
    }

    const ticket = await service.updateTicketStatus(id, status, context);
    return NextResponse.json(ticket);
  } catch (error: any) {
    console.error("Error in ticket status update:", error);
    return NextResponse.json(
      { error: error.message || "خطا در تغییر وضعیت تیکت" },
      { status: 500 }
    );
  }
}
