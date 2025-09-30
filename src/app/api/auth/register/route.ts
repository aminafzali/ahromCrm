// مسیر فایل: src/app/api/auth/register/route.ts (نسخه اصلاح‌شده)

import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(1, "نام الزامی است"),
  phone: z.string().min(10, "شماره تلفن نامعتبر است"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
  address: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = userSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 }
      );
    }

    const { name, phone, address, password } = validation.data;

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      return NextResponse.json(
        { error: "کاربری با این شماره تلفن از قبل وجود دارد" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        address,
        password: hashedPassword,
        // ** اصلاحیه کلیدی: فیلد role که دیگر وجود ندارد، حذف شده است **
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(
      { message: "User registered successfully", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "خطای داخلی سرور" }, { status: 500 });
  }
}
