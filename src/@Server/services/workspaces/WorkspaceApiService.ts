// مسیر فایل: src/@Server/services/workspaces/WorkspaceApiService.ts

import {
  ForbiddenException,
  ValidationException,
} from "@/@Server/Exceptions/BaseException";
import prisma from "@/lib/prisma";
import { Workspace } from "@prisma/client";
import { cache } from "react";
import { z } from "zod";

export const workspaceSchema = z.object({
  name: z.string().min(3, "نام ورک‌اسپیس باید حداقل ۳ کاراکتر باشد."),
  slug: z
    .string()
    .min(3, "اسلاگ باید حداقل ۳ کاراکتر باشد.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "اسلاگ نامعتبر است."),
});

export class WorkspaceApiService {
  async create(data: any, context?: any): Promise<Workspace> {
    if (!context || !context.user) {
      throw new ForbiddenException(
        "User must be logged in to create a workspace."
      );
    }

    try {
      const validatedData = workspaceSchema.parse(data);
      const { name, slug } = validatedData;
      const ownerId = context.user.id;

      return prisma.$transaction(async (tx) => {
        const workspace = await tx.workspace.create({
          data: { name, slug, ownerId },
        });

        // ===== شروع اصلاحیه کلیدی =====
        // به جای پیدا کردن نقش سراسری، یک نقش "Admin" جدید مخصوص همین ورک‌اسپیس می‌سازیم.
        const adminRole = await tx.role.create({
          data: {
            name: "Admin",
            description: "دسترسی کامل به تمام بخش‌های ورک‌اسپیس",
            workspaceId: workspace.id, // نقش را به ورک‌اسپیس جدید متصل می‌کنیم
          },
        });
        // ===== پایان اصلاحیه کلیدی =====

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
      // خطای اصلی را دوباره پرتاب می‌کنیم تا در کنترلر مدیریت شود
      throw error;
    }
  }
}

/**
 * تمام ورک‌اسپیس‌های فعال را برای نمایش در لندینگ پیج واکشی می‌کند.
 */
export async function getAllPublicWorkspaces() {
  try {
    const workspaces = await prisma.workspace.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return workspaces;
  } catch (error) {
    console.error("خطا در واکشی لیست ورک‌اسپیس‌ها:", error);
    return [];
  }
}

/**
 * اطلاعات یک ورک‌اسپیس را بر اساس slug برای صفحات عمومی واکشی می‌کند.
 * از cache برای جلوگیری از کوئری‌های تکراری در یک درخواست استفاده شده است.
 */
export const getWorkspaceDataBySlug = cache(async (slug: string) => {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          take: 8,
          orderBy: { createdAt: "desc" },
          include: { images: true, brand: true, category: true },
        },
        serviceTypes: {
          where: { isActive: true },
          take: 6,
          orderBy: { name: "asc" },
        },
      },
    });
    return workspace;
  } catch (error) {
    console.error("خطا در واکشی اطلاعات ورک‌اسپیس:", error);
    return null;
  }
});
