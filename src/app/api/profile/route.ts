// مسیر فایل: src/app/api/profile/route.ts (نسخه نهایی، کامل و اصلاح‌شده)

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client"; // ++ برای دسترسی به تایپ‌های Prisma
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2, "نام باید حداقل 2 کاراکتر باشد").optional(),
  email: z.string().email("ایمیل نامعتبر است").optional().nullable(),
  address: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Error fetching profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 }
      );
    }

    const { name, email, address } = validation.data;

    // ++ اصلاحیه کلیدی و نهایی: ساخت آبجکت داده مطابق با قوانین Prisma ++
    const dataToUpdate: Prisma.UserUpdateInput = {};

    if (name !== undefined) {
      dataToUpdate.name = name;
    }
    if (email !== undefined) {
      // اگر email برابر با null بود، به Prisma می‌گوییم آن را null کند، در غیر این صورت مقدار جدید را ست می‌کنیم
      dataToUpdate.email = email;
    }
    if (address !== undefined) {
      // اگر address برابر با null بود، به Prisma می‌گوییم آن را null کند، در غیر این صورت مقدار جدید را ست می‌کنیم
      dataToUpdate.address = address || "";
    }

    const userId = parseInt(session.user.id, 10);
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Error updating profile" },
      { status: 500 }
    );
  }
}
