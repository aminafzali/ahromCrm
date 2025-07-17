// مسیر فایل: src/app/api/auth/verify-pass/routes.ts (نسخه نهایی و کامل)

import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const loginSchema = z.object({
  phone: z.string().min(10, { message: "شماره تلفن نامعتبر است" }),
  password: z
    .string()
    .min(6, { message: "رمز عبور باید حداقل ۶ کاراکتر باشد" }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 }
      );
    }

    const { phone, password } = validation.data;

    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "شماره تلفن یا رمز عبور نامعتبر است" },
        { status: 401 }
      );
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "شماره تلفن یا رمز عبور نامعتبر است" },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in .env file");
    }

    // ++ اصلاحیه: حذف فیلد role از توکن JWT ++
    // در این مرحله، ما فقط هویت کاربر را تایید می‌کنیم.
    // نقش کاربر بعداً بر اساس ورک‌اسپیس انتخابی مشخص می‌شود.
    const authToken = jwt.sign(
      {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
      },
      secret,
      { expiresIn: "30d" }
    );

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        // ++ اصلاحیه: فیلد role که دیگر وجود ندارد، حذف شده است ++
      },
      token: authToken,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return NextResponse.json(
      { error: "An error occurred while logging in" },
      { status: 500 }
    );
  }
}
