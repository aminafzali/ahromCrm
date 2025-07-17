// مسیر فایل: src/@Server/Providers/AuthProvider.ts

import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from "../Exceptions/BaseException";

export class AuthProvider {
  static async isAuthenticated(
    req: NextRequest,
    mustBeLoggedIn = true,
    requireWorkspaceContext = true // ++ پارامتر جدید برای کنترل بررسی ورک‌اسپیس ++
  ) {
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

    // اگر نیازی به context ورک‌اسپیس نبود، فقط اطلاعات کاربر را برمی‌گردانیم
    if (!requireWorkspaceContext) {
      return { user, workspaceId: null, role: null };
    }

    const workspaceIdHeader = req.headers.get("X-Workspace-Id");
    if (!workspaceIdHeader) {
      throw new BadRequestException("X-Workspace-Id header is required");
    }
    const workspaceId = parseInt(workspaceIdHeader, 10);

    if (isNaN(workspaceId)) {
      throw new BadRequestException("Invalid Workspace ID format");
    }

    const workspaceUser = await prisma.workspaceUser.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: user!.id } },
      include: { role: true },
    });

    if (!workspaceUser && mustBeLoggedIn) {
      throw new ForbiddenException("Access denied to this workspace");
    }

    return { user, workspaceId, role: workspaceUser?.role };
  }

  static async isAdmin(req: NextRequest) {
    const context = await this.isAuthenticated(req, true, true);
    if (context.role?.name !== "Admin") {
      throw new ForbiddenException("Admin access required");
    }
    return context;
  }
}
