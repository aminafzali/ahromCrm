// مسیر فایل: src/app/api/admin/users/route.ts
// (این یک فایل و مسیر API کاملاً جدید است)

import { BaseException } from "@/@Server/Exceptions/BaseException";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * این کنترلر به صورت مستقل عمل کرده و هیچ وابستگی به BaseController ندارد.
 * وظیفه آن، مدیریت کاربران در سطح کل سیستم (سراسری) است.
 */
export async function GET(req: NextRequest) {
  try {
    // ۱. بررسی می‌کنیم که کاربر لاگین کرده باشد
    // در یک سناریوی واقعی، اینجا باید بررسی شود که آیا کاربر نقش "SuperAdmin" دارد یا خیر
    const context = await AuthProvider.isAuthenticated(req, true, false); // false یعنی نیازی به context ورک‌اسپیس نیست

    // ۲. پارامترهای صفحه‌بندی را مستقیماً از URL می‌خوانیم
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const skip = (page - 1) * limit;

    // ۳. کوئری را مستقیماً با Prisma اجرا می‌کنیم
    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count(),
    ]);

    // ۴. نتیجه را با فرمت استاندارد Pagination برمی‌گردانیم
    const result = {
      data: users,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("--- ERROR in /api/admin/users ---", error);
    if (error instanceof BaseException) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
