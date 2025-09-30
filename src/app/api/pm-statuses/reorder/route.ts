import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // 1. احراز هویت کاربر با استفاده از الگوی اختصاصی پروژه شما
    //    هر دو پارامتر دوم و سوم true هستند چون هم به کاربر و هم به ورک‌اسپیس نیاز داریم
    const context = await AuthProvider.isAuthenticated(req, true, true);

    // 2. بررسی اینکه آیا کاربر و ورک‌اسپیس معتبر هستند یا نه
    if (!context.user || !context.workspaceId) {
      // AuthProvider خودش خطای 401 را مدیریت می‌کند، اما این یک لایه اطمینان اضافی است
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const workspaceId = context.workspaceId;

    // 3. خواندن بدنه‌ی درخواست
    const body = await req.json();
    const { statuses } = body;

    if (!Array.isArray(statuses)) {
      return NextResponse.json(
        { error: "داده‌های ارسال شده معتبر نیست." },
        { status: 400 }
      );
    }

    // 4. اجرای عملیات در یک تراکنش واحد با استفاده از Prisma
    const updatePromises = statuses.map(
      (status: { id: number; order: number }) =>
        prisma.pMStatus.update({
          where: {
            id: status.id,
            // شرط امنیتی برای اطمینان از اینکه کاربر فقط وضعیت‌های محیط کاری خودش را تغییر می‌دهد
            workspaceId: workspaceId,
          },
          data: {
            order: status.order,
          },
        })
    );

    await prisma.$transaction(updatePromises);

    return NextResponse.json(
      { message: "ترتیب با موفقیت به‌روزرسانی شد." },
      { status: 200 }
    );
  } catch (error: any) {
    // مدیریت خطاها مطابق با الگوی فایل workspaces/route.ts
    if (error.statusCode === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "An internal server error occurred.", details: error.message },
      { status: 500 }
    );
  }
}
