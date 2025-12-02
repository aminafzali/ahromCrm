import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { NextRequest, NextResponse } from "next/server";
import { ChequeServiceApi } from "../../../service/ChequeServiceApi";
import { updateChequeStatusSchema } from "../../../validation/schema";

const service = new ChequeServiceApi();

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
        { error: "شناسه چک نامعتبر است" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validatedData = updateChequeStatusSchema.parse(body);
    const { status } = validatedData;

    // استفاده از متد updateChequeStatus که هوک‌های beforeStatusChange و afterStatusChange را فراخوانی می‌کند
    const updatedCheque = await service.updateChequeStatus(id, status, context);

    return NextResponse.json({
      message: "وضعیت چک با موفقیت تغییر کرد",
      data: updatedCheque,
    });
  } catch (error: any) {
    console.error("Error in cheque status update:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "داده‌های ورودی نامعتبر است", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "خطا در تغییر وضعیت چک" },
      { status: 500 }
    );
  }
}
