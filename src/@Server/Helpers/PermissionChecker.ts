import prisma from "@/lib/prisma";
import { AuthContext } from "../Http/Controller/BaseController";

/**
 * PermissionChecker Helper
 * برای بررسی دسترسی‌های سطح Module/Action در ورک‌اسپیس
 */
export class PermissionChecker {
  /**
   * بررسی می‌کند که آیا کاربر دسترسی به action خاصی دارد یا خیر
   * @param context - زمینه احراز هویت شده کاربر
   * @param action - اکشن مورد نظر (مثلاً "inventory.view")
   * @returns true اگر دسترسی داشت، false در غیر این صورت
   */
  static async hasPermission(
    context: AuthContext,
    action: string
  ): Promise<boolean> {
    // اگر کاربر Admin است، به همه چیز دسترسی دارد
    if (context.role?.name === "Admin") {
      return true;
    }

    if (!context.workspaceId || !context.role?.id) {
      return false;
    }

    // بررسی اینکه آیا این اکشن به نقش کاربر assign شده یا خیر
    const permission = await prisma.permission.findUnique({
      where: {
        action_workspaceId: {
          action,
          workspaceId: context.workspaceId,
        },
      },
      include: {
        roles: {
          where: { roleId: context.role.id },
        },
      },
    });

    if (!permission) {
      // اگر permission اصلاً تعریف نشده، رد می‌کنیم
      return false;
    }

    // اگر این نقش به این permission دسترسی دارد
    return permission.roles.length > 0;
  }

  /**
   * بررسی می‌کند که آیا کاربر به حداقل یکی از actionها دسترسی دارد
   */
  static async hasAnyPermission(
    context: AuthContext,
    actions: string[]
  ): Promise<boolean> {
    if (context.role?.name === "Admin") {
      return true;
    }

    for (const action of actions) {
      if (await this.hasPermission(context, action)) {
        return true;
      }
    }

    return false;
  }

  /**
   * بررسی می‌کند که آیا کاربر به همه actionها دسترسی دارد
   */
  static async hasAllPermissions(
    context: AuthContext,
    actions: string[]
  ): Promise<boolean> {
    if (context.role?.name === "Admin") {
      return true;
    }

    for (const action of actions) {
      if (!(await this.hasPermission(context, action))) {
        return false;
      }
    }

    return true;
  }

  /**
   * middleware برای API routes
   * اگر دسترسی نداشت، exception پرتاب می‌کند
   */
  static async requirePermission(
    context: AuthContext,
    action: string
  ): Promise<void> {
    const hasAccess = await this.hasPermission(context, action);
    if (!hasAccess) {
      throw new Error(`Access denied. Required permission: ${action}`);
    }
  }
}
