// مسیر فایل: src/middleware.ts (نسخه نهایی و کامل)

import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // مسیرهای عمومی API که نیازی به احراز هویت ندارند
  const publicApiRoutes = [
    "/api/auth", // تمام مسیرهای زیرمجموعه /api/auth
    "/api/cron", // مسیر کران جاب
  ];

  // اگر مسیر یکی از مسیرهای عمومی API بود، اجازه عبور می‌دهیم
  if (publicApiRoutes.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // گرفتن توکن کاربر از کوکی‌ها
  const token = await getToken({ req: request });

  // اگر کاربر توکن ندارد (لاگین نکرده است)...
  if (!token) {
    // ... و تلاش می‌کند به یک API محافظت‌شده دسترسی پیدا کند، خطای 401 برمی‌گردانیم.
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ... و تلاش می‌کند به یک صفحه محافظت‌شده (مانند داشبورد) دسترسی پیدا کند، او را به صفحه لاگین هدایت می‌کنیم.
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ++ اصلاحیه کلیدی و نهایی: حذف کامل منطق بررسی token.role ++
  // middleware دیگر نگران نقش کاربر نیست. این وظیفه به لایه‌های بعدی (AuthProvider) واگذار شده است.
  // اگر کاربر توکن دارد، اجازه دسترسی به تمام مسیرهای محافظت‌شده را می‌دهیم.

  return NextResponse.next();
}

// کانفیگ middleware برای اجرا شدن فقط روی مسیرهای مشخص شده
export const config = {
  matcher: [
    // تمام مسیرهای داشبورد، پنل و بخش مدیریت جدید را محافظت می‌کنیم
    "/dashboard/:path*",
    "/panel/:path*",
    "/manage/:path*",
    // تمام مسیرهای API (به جز موارد عمومی که در بالا تعریف شد) را محافظت می‌کنیم
    "/api/((?!auth|cron).*)",
  ],
};
