// مسیر فایل: src/app/api/auth/verify-otp/route.ts (نسخه نهایی و کامل)

import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const verifyOtpSchema = z.object({
  phone: z.string().min(10, "شماره تلفن نامعتبر است"),
  otp: z.string().length(6, "کد تایید باید ۶ رقم باشد"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = verifyOtpSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 }
      );
    }

    const { phone, otp } = validation.data;

    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      return NextResponse.json(
        { error: "کاربری با این شماره یافت نشد" },
        { status: 404 }
      );
    }

    if (user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
      return NextResponse.json(
        { error: "کد تایید نامعتبر یا منقضی شده است" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { phone },
      data: { otp: null, otpExpires: null },
    });

    // در اینجا باید از next-auth برای ایجاد نشست استفاده شود
    // این API فقط موفقیت‌آمیز بودن تایید را اعلام می‌کند
    return NextResponse.json({
      message: "OTP verified successfully. You can now log in.",
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        // ** اصلاحیه: فیلد role که دیگر وجود ندارد، حذف شده است **
      },
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "خطای داخلی سرور" },
      { status: 500 }
    );
  }
}
