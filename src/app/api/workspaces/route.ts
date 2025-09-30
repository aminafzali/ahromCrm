// مسیر فایل: src/app/api/workspaces/route.ts

import {
  BaseException,
  UnauthorizedException,
  ValidationException,
} from "@/@Server/Exceptions/BaseException";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// اسکیمای اعتبارسنجی مستقل
const workspaceSchema = z.object({
  name: z.string().min(3, "نام ورک‌اسپیس باید حداقل ۳ کاراکتر باشد."),
  slug: z
    .string()
    .min(3, "اسلاگ باید حداقل ۳ کاراکتر باشد.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "اسلاگ نامعتبر است."),
});

export async function POST(req: NextRequest) {
  console.log("--- DEBUG: POST /api/workspaces route hit ---");
  try {
    const context = await AuthProvider.isAuthenticated(req, true, false);
    if (!context.user) {
      throw new UnauthorizedException("User is not authenticated.");
    }

    const body = await req.json();
    console.log("--- DEBUG: Received body:", body);
    const validatedData = workspaceSchema.parse(body);
    const { name, slug } = validatedData;
    const ownerId = context.user.id;

    const newWorkspace = await prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: { name, slug, ownerId },
      });

      // نقش "مدیر" را برای ورک‌اسپیس جدید ایجاد می‌کنیم
      const adminRole = await tx.role.create({
        data: {
          name: "Admin",
          description: "نقش مدیر: دسترسی کامل به تمام بخش‌های ورک‌اسپیس",
          workspaceId: workspace.id,
        },
      });

      // ===== شروع اصلاحیه کلیدی =====
      // نقش "کاربر عادی" را نیز برای استفاده در آینده، همزمان ایجاد می‌کنیم
      await tx.role.create({
        data: {
          name: "User",
          description:
            "کاربر عادی: دسترسی فقط به بعضی از بخش های مربوط به خودش مثل فاکتورها ، درخواست ها و وضعیت درخواست ، اعلان ها و پروفایل",
          workspaceId: workspace.id,
        },
      });
      // ===== پایان اصلاحیه کلیدی =====

      // کاربر سازنده را با نقش "مدیر" به ورک‌اسپیس اضافه می‌کنیم
      await tx.workspaceUser.create({
        data: {
          workspaceId: workspace.id,
          userId: ownerId,
          roleId: adminRole.id,
        },
      });

      return workspace;
    });

    console.log("--- DEBUG: Workspace created successfully ---", newWorkspace);
    return NextResponse.json(newWorkspace, { status: 201 });
  } catch (error: any) {
    console.error("--- DEBUG: Error in POST /api/workspaces ---", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: new ValidationException(error.format()).errors },
        { status: 422 }
      );
    }
    if (error instanceof BaseException) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "An internal server error occurred.", details: error.message },
      { status: 500 }
    );
  }
}
