import { ApiResponse } from "@/@Server/Http/Response/ApiResponse";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = Number(searchParams.get("workspaceId"));

    if (!workspaceId) {
      return ApiResponse.badRequest("شناسه کسب‌وکار ارسال نشده است.");
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // پیدا کردن آخرین شماره برای این ماه و workspace
    const lastNumber = await prisma.notificationNumber.findFirst({
      where: { year, month, workspaceId },
      orderBy: { number: "desc" },
    });

    const nextNumber = lastNumber ? lastNumber.number + 1 : 1;
    const notificationNumberName = `NO-${year}${month
      .toString()
      .padStart(2, "0")}${nextNumber.toString().padStart(4, "0")}`;

    // ذخیره شماره جدید در دیتابیس
    await prisma.notificationNumber.create({
      data: { year, month, number: nextNumber, workspaceId },
    });

    return ApiResponse.success({
      notificationNumber: nextNumber,
      notificationNumberName,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to retrieve next notification number";
    return ApiResponse.internalServerError(errorMessage, error);
  }
}
