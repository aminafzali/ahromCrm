// مسیر فایل: src/app/api/user/workspaces/route.ts

import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * این API، لیست تمام ورک‌اسپیس‌هایی که کاربر فعلی در آنها عضو است
 * به همراه نقش او در هر کدام را برمی‌گرداند.
 */
export async function GET(req: NextRequest) {
  try {
    // احراز هویت کاربر بدون نیاز به هدر ورک‌اسپیس
    // ما mustBeLoggedIn را true می‌فرستیم اما چون هدر ورک‌اسپیس نداریم، AuthProvider فقط کاربر را برمی‌گرداند.
    const context = await AuthProvider.isAuthenticated(req, true);

    if (!context.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userWorkspaces = await prisma.workspaceUser.findMany({
      where: {
        userId: context.user.id,
      },
      include: {
        workspace: true, // اطلاعات کامل ورک‌اسپیس را جوین می‌کنیم
        role: true, // اطلاعات کامل نقش را نیز جوین می‌کنیم
      },
      orderBy: {
        workspace: {
          createdAt: "asc",
        },
      },
    });

    return NextResponse.json(userWorkspaces, { status: 200 });
  } catch (error: any) {
    if (error.statusCode === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
