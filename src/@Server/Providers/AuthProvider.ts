// مسیر فایل: src/@Server/Providers/AuthProvider.ts

import { Role } from ".prisma/client";
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
  static async isAuthenticated(
    req: NextRequest,
    mustBeLoggedIn = true,
    // این پارامتر جدید به ما اجازه می‌دهد در موارد خاص، بررسی ورک‌اسپیس را غیرفعال کنیم
    requireWorkspaceContext = true
  ) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id && mustBeLoggedIn) {
      throw new UnauthorizedException("Not authenticated");
    }

    if (!session?.user?.id) {
      return { user: null, workspaceId: null, role: null, workspaceUser: null };
    }

    const userId = parseInt(session.user.id, 10);
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user && mustBeLoggedIn) {
      throw new UnauthorizedException("User not found");
    }

    // اگر نیازی به context ورک‌اسپیس نبود (مثلاً در زمان ساخت اولین ورک‌اسپیس)، فقط اطلاعات کاربر را برمی‌گردانیم
    if (!requireWorkspaceContext) {
      return { user, workspaceId: null, role: null, workspaceUser: null };
    }

    const workspaceIdHeader = req.headers.get("X-Workspace-Id");
    if (!workspaceIdHeader) {
      throw new BadRequestException(
        "X-Workspace-Id header is required for this operation."
      );
    }
    const workspaceId = parseInt(workspaceIdHeader, 10);

    if (isNaN(workspaceId)) {
      throw new BadRequestException(
        "Invalid Workspace ID format in X-Workspace-Id header."
      );
    }

    // بررسی اینکه آیا کاربر عضو این ورک‌اسپیس است یا خیر
    const workspaceUser = await prisma.workspaceUser.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: user!.id } },
      include: { role: true }, // نقش کاربر را نیز به همراه اطلاعات آن دریافت می‌کنیم
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
      role: workspaceUser?.role as Role | null, // آبجکت کامل نقش کاربر (شامل id, name, description)
      workspaceUser,
    };
  }

  /**
   * بررسی می‌کند که آیا کاربر در ورک‌اسپیس فعلی، نقش "Admin" را دارد یا خیر.
   */
  static async isAdmin(req: NextRequest) {
    // این متد همیشه باید context کامل ورک‌اسپیس را بررسی کند
    const context = await this.isAuthenticated(req, true, true);
    if (context.role?.name !== "Admin") {
      throw new ForbiddenException("Admin access required");
    }
    return context;
  }
}
