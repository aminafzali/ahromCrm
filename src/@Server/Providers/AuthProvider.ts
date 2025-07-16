// مسیر فایل: src/@Server/Providers/AuthProvider.ts (نسخه نهایی و کامل)

import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from "../Exceptions/BaseException";

/**
 * این کلاس مسئولیت کامل احراز هویت و کنترل دسترسی را بر عهده دارد
 * و اکنون مفهوم ورک‌اسپیس را به طور کامل درک می‌کند.
 */
export class AuthProvider {
  /**
   * بررسی می‌کند که آیا کاربر احراز هویت شده و به ورک‌اسپیس مشخص شده دسترسی دارد یا خیر.
   * یک آبجکت "زمینه" (Context) کامل شامل کاربر، شناسه ورک‌اسپیس و نقش کاربر در آن ورک‌اسپیس را برمی‌گرداند.
   */
  static async isAuthenticated(req: NextRequest, mustBeLoggedIn = true) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email && mustBeLoggedIn) {
      throw new UnauthorizedException("Not authenticated");
    }

    if (!session?.user?.email) {
      return { user: null, workspaceId: null, role: null };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user && mustBeLoggedIn) {
      throw new UnauthorizedException("User not found");
    }

    // ++ منطق جدید برای تشخیص ورک‌اسپیس و نقش ++
    const workspaceIdHeader = req.headers.get("X-Workspace-Id");
    if (!workspaceIdHeader && mustBeLoggedIn) {
      // اگر هدر وجود نداشت، یک خطای واضح برمی‌گردانیم
      throw new BadRequestException(
        "X-Workspace-Id header is required for this operation."
      );
    }

    const workspaceId = parseInt(workspaceIdHeader as string, 10);

    if (isNaN(workspaceId) && mustBeLoggedIn) {
      throw new BadRequestException(
        "Invalid Workspace ID format in X-Workspace-Id header."
      );
    }

    // اگر لاگین بودن الزامی نباشد و هدر هم نباشد، context خالی برگردان
    if (!mustBeLoggedIn && !workspaceIdHeader) {
      return { user, workspaceId: null, role: null };
    }

    // بررسی اینکه آیا کاربر عضو این ورک‌اسپیس است یا خیر
    const workspaceUser = await prisma.workspaceUser.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: workspaceId,
          userId: user!.id,
        },
      },
      include: {
        role: true, // نقش کاربر را نیز به همراه اطلاعات آن دریافت می‌کنیم
      },
    });

    if (!workspaceUser && mustBeLoggedIn) {
      throw new ForbiddenException(
        "Access denied. You are not a member of this workspace."
      );
    }

    // برگرداندن یک آبجکت "زمینه" (Context) کامل
    return {
      user,
      workspaceId,
      role: workspaceUser?.role, // آبجکت کامل نقش کاربر (شامل id, name, description)
    };
  }

  /**
   * بررسی می‌کند که آیا کاربر در ورک‌اسپیس فعلی، نقش "Admin" را دارد یا خیر.
   */
  static async isAdmin(req: NextRequest) {
    const context = await this.isAuthenticated(req, true);
    // فرض می‌کنیم نقشی با نام "Admin" برای مدیران تعریف شده است
    if (context.role?.name !== "Admin") {
      throw new ForbiddenException("Admin access required");
    }
    return context;
  }
}
