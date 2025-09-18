import { ApiResponse } from "@/@Server/Http/Response/ApiResponse";
import  {getSession}  from "@/lib/auth";
import { prisma } from "@/lib/prisma"; // <<-- استفاده مستقیم از Prisma
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // گرفتن session برای دسترسی به workspaceId
    const session = await getSession();
    const workspaceId = session?.user.workspaceId;

    if (!workspaceId) {
      return ApiResponse.unauthorized();
    }

    const body = await req.json();
    const { statuses } = body;

    if (!Array.isArray(statuses)) {
      return ApiResponse.badRequest("داده‌های ارسال شده معتبر نیست.");
    }

    // منطق به‌روزرسانی ترتیب در یک تراکنش، مستقیماً در اینجا پیاده‌سازی شده است
    const updatePromises = statuses.map((status: { id: number; order: number }) =>
      prisma.pMStatus.update({
        where: {
          id: status.id,
          workspaceId: workspaceId, // شرط امنیتی برای اطمینان از دسترسی کاربر
        },
        data: {
          order: status.order,
        },
      })
    );

    await prisma.$transaction(updatePromises);

    return ApiResponse.success("ترتیب با موفقیت به‌روزرسانی شد.");
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "خطا در به‌روزرسانی ترتیب وضعیت‌ها";
    return ApiResponse.internalServerError(errorMessage, error);
  }
}