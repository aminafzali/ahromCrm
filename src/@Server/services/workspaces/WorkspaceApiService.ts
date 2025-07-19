// مسیر فایل: src/@Server/services/workspaces/WorkspaceApiService.ts

import {
  ForbiddenException,
  ValidationException,
} from "@/@Server/Exceptions/BaseException";
import prisma from "@/lib/prisma";
import { Workspace } from "@prisma/client";
import { z } from "zod";

// اسکیمای اعتبارسنجی در همین فایل تعریف می‌شود تا کاملا مستقل باشد
export const workspaceSchema = z.object({
  name: z.string().min(3, "نام ورک‌اسپیس باید حداقل ۳ کاراکتر باشد."),
  slug: z
    .string()
    .min(3, "اسلاگ باید حداقل ۳ کاراکتر باشد.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "اسلاگ نامعتبر است."),
});

/**
 * این یک سرویس کاملاً مستقل برای مدیریت منطق کسب‌وکار ورک‌اسپیس‌ها است.
 */
export class WorkspaceApiService {
  /**
   * یک ورک‌اسپیس جدید ایجاد کرده و مالک آن را به عنوان اولین عضو با نقش ادمین ثبت می‌کند.
   */
  async create(data: any, context?: any): Promise<Workspace> {
    if (!context || !context.user) {
      throw new ForbiddenException(
        "User must be logged in to create a workspace."
      );
    }

    // اعتبارسنجی داده‌های ورودی
    try {
      const validatedData = workspaceSchema.parse(data);
      const { name, slug } = validatedData;
      const ownerId = context.user.id;

      return prisma.$transaction(async (tx) => {
        const workspace = await tx.workspace.create({
          data: { name, slug, ownerId },
        });
        const adminRole = await tx.role.upsert({
          where: { name: "Admin" },
          update: {},
          create: { name: "Admin", description: "دسترسی کامل" },
        });
        await tx.workspaceUser.create({
          data: {
            workspaceId: workspace.id,
            userId: ownerId,
            roleId: adminRole.id,
          },
        });
        return workspace;
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationException(error.format());
      }
      throw error;
    }
  }
}
