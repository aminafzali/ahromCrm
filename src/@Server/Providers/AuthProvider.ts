// مسیر فایل: src/@Server/Providers/AuthProvider.ts

import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/authOptions";
import {
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
} from "../Exceptions/BaseException";
import prisma from "@/lib/prisma";
import { User } from "@prisma/client";

export class AuthProvider {
  /**
   * Checks if the user is authenticated and has access to the specified workspace.
   * Returns a full context object including user, workspaceId, and role.
   */
  static async isAuthenticated(req: NextRequest, mustBeLoggedIn = true) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email && mustBeLoggedIn) {
      throw new UnauthorizedException("Not authenticated");
    }
    
    // اگر کاربر لاگین نکرده بود و الزامی هم نبود، یک context خالی برمی‌گردانیم
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
    // ما شناسه ورک‌اسپیس را از یک هدر سفارشی در درخواست می‌خوانیم
    const workspaceIdHeader = req.headers.get("X-Workspace-Id");
    if (!workspaceIdHeader && mustBeLoggedIn) {
      throw new BadRequestException("X-Workspace-Id header is required");
    }
    const workspaceId = parseInt(workspaceIdHeader as string, 10);

    if (isNaN(workspaceId) && mustBeLoggedIn) {
      throw new BadRequestException("Invalid Workspace ID format");
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
        role: true, // نقش کاربر را نیز دریافت می‌کنیم
      },
    });

    if (!workspaceUser && mustBeLoggedIn) {
      throw new ForbiddenException("Access denied to this workspace");
    }

    // برگرداندن یک آبجکت "زمینه" (Context) کامل
    return {
      user,
      workspaceId,
      role: workspaceUser?.role, // آبجکت کامل نقش کاربر در این ورک‌اسپیس
    };
  }

  /**
   * Checks if the user is an admin within the current workspace context.
   */
  static async isAdmin(req: NextRequest) {
    const context = await this.isAuthenticated(req);
    // فرض می‌کنیم نقشی با نام "Admin" برای مدیران تعریف شده است
    if (context.role?.name !== "Admin") {
      throw new ForbiddenException("Admin access required");
    }
    return context;
  }
}