// // مسیر فایل: src/app/api/auth/send-otp/route.ts
// مسیر فایل: src/app/api/auth/send-otp/route.ts

import prisma from "@/lib/prisma";
import { SmsHelper } from "@/lib/smsHelper";
import { randomInt } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const phoneSchema = z.object({
  phone: z.string().min(10, { message: "شماره تلفن نامعتبر است" }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = phoneSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 }
      );
    }
    const { phone } = validation.data;

    const otp = randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 دقیقه بعد // پیدا کردن یا ساختن کاربر و ذخیره OTP در دیتابیس

    await prisma.user.upsert({
      where: { phone },
      update: {
        otp,
        otpExpires: expires,
      },
      create: {
        phone,
        otp,
        otpExpires: expires, // ** اصلاحیه کلیدی: فیلد role که دیگر وجود ندارد، حذف شده است **
      },
    }); // ✅ این بخش برای شماره‌های عادی دوباره فعال شد و درست کار خواهد کرد.

    const smsResponse = await SmsHelper.send(phone, otp);

    if (smsResponse.status > 201) {
      // بررسی پاسخ سرویس پیامک
      console.error("[SMS_SEND_FAILED]", smsResponse);
      throw new Error(smsResponse.message || "خطا در ارسال پیامک");
    }

    return NextResponse.json(
      { message: "کد تایید با موفقیت ارسال شد" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[SEND_OTP_ERROR]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "خطای داخلی سرور" },
      { status: 500 }
    );
  }
}
// import prisma from "@/lib/prisma";
// import { SmsHelper } from "@/lib/smsHelper";
// import { randomInt } from "crypto";
// import { NextRequest, NextResponse } from "next/server";
// import { z } from "zod";

// const phoneSchema = z.object({
//   phone: z.string().min(10, { message: "شماره تلفن نامعتبر است" }),
// });

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();

//     const validation = phoneSchema.safeParse(body);
//     if (!validation.success) {
//       return NextResponse.json(
//         { error: validation.error.format() },
//         { status: 400 }
//       );
//     }
//     const { phone } = validation.data;

//     const otp = randomInt(100000, 999999).toString();
//     const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 دقیقه بعد

//     // پیدا کردن یا ساختن کاربر و ذخیره OTP در دیتابیس
//     await prisma.user.upsert({
//       where: { phone },
//       update: {
//         otp,
//         otpExpires: expires,
//       },
//       create: {
//         phone,
//         otp,
//         otpExpires: expires,
//         // ** اصلاحیه کلیدی: فیلد role که دیگر وجود ندارد، حذف شده است **
//       },
//     });

//     const smsResponse = await SmsHelper.send(phone, otp);

//     if (smsResponse.status > 201) {
//       // بررسی پاسخ سرویس پیامک
//       console.error("[SMS_SEND_FAILED]", smsResponse);
//       throw new Error(smsResponse.message || "خطا در ارسال پیامک");
//     }

//     return NextResponse.json(
//       { message: "کد تایید با موفقیت ارسال شد" },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("[SEND_OTP_ERROR]", error);
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : "خطای داخلی سرور" },
//       { status: 500 }
//     );
//   }
// }
