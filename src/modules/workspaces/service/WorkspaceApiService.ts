// مسیر فایل: src/modules/workspaces/service/WorkspaceApiService.ts

import { ForbiddenException } from "@/@Server/Exceptions/BaseException";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { Workspace } from "@prisma/client";
import { searchFileds } from "../data/fetch";
import { workspaceSchema } from "../validation/schema";

// یک ریپازیتوری داخلی فقط برای استفاده در این سرویس
class Repository extends BaseRepository<Workspace> {
  constructor() {
    super("Workspace");
  }
}

/**
 * این سرویس، منطق پیچیده مربوط به ایجاد و مدیریت ورک‌اسپیس‌ها را کپسوله می‌کند.
 */
export class WorkspaceApiService extends BaseService<Workspace> {
  constructor() {
    super(
      new Repository(),
      workspaceSchema,
      workspaceSchema.partial(), // برای متد update
      searchFileds
    );
  }

  /**
   * ما متد create را بازنویسی (override) می‌کنیم تا منطق سفارشی خود را اضافه کنیم.
   * @param data داده‌های ورودی برای ساخت ورک‌اسپیس (شامل name و slug).
   * @param context آبجکت احراز هویت شامل کاربر و ورک‌اسپیس فعال.
   */
  async create(data: any, context?: any): Promise<Workspace> {
    if (!context || !context.user) {
      throw new ForbiddenException(
        "User must be logged in to create a workspace."
      );
    }

    const { name, slug } = data;
    const ownerId = context.user.id;

    // استفاده از تراکنش پریزما برای تضمین اجرای تمام عملیات با هم
    const newWorkspace = await prisma.$transaction(async (tx) => {
      // قدم اول: ساخت ورک‌اسپیس
      const workspace = await tx.workspace.create({
        data: {
          name,
          slug,
          ownerId,
        },
      });

      // قدم دوم: پیدا کردن یا ساختن نقش "Admin"
      const adminRole = await tx.role.upsert({
        where: { name: "Admin" },
        update: {},
        create: {
          name: "Admin",
          description: "دسترسی کامل به تمام منابع ورک‌اسپیس",
        },
      });

      // قدم سوم: انتساب کاربر به ورک‌اسپیس جدید با نقش ادمین
      await tx.workspaceUser.create({
        data: {
          workspaceId: workspace.id,
          userId: ownerId,
          roleId: adminRole.id,
        },
      });

      return workspace;
    });

    return newWorkspace;
  }
}
