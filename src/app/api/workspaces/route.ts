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
    // ۱. احراز هویت کاربر (بدون نیاز به ورک‌اسپیس)
    const context = await AuthProvider.isAuthenticated(req, true, false);
    if (!context.user) {
      throw new UnauthorizedException("User is not authenticated.");
    }

    // ۲. دریافت و اعتبارسنجی داده‌ها
    const body = await req.json();
    console.log("--- DEBUG: Received body:", body);
    const validatedData = workspaceSchema.parse(body);
    const { name, slug } = validatedData;
    const ownerId = context.user.id;

    // ۳. اجرای منطق در یک تراکنش
    const newWorkspace = await prisma.$transaction(async (tx) => {
      // الف) ورک‌اسپیس جدید را می‌سازیم
      const workspace = await tx.workspace.create({
        data: { name, slug, ownerId },
      });

      // ===== شروع اصلاحیه کلیدی =====
      // ب) به جای پیدا کردن نقش سراسری، یک نقش "Admin" جدید مخصوص همین ورک‌اسپیس می‌سازیم.
      const adminRole = await tx.role.create({
        data: {
          name: "Admin",
          description: "دسترسی کامل به تمام بخش‌های ورک‌اسپیس",
          workspaceId: workspace.id, // نقش را به ورک‌اسپیس جدید متصل می‌کنیم
        },
      });
      // ===== پایان اصلاحیه کلیدی =====

      // ج) کاربر سازنده را با این نقش جدید به ورک‌اسپیس اضافه می‌کنیم
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
    // مدیریت خطاها
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
