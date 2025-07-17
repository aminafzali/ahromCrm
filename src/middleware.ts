// مسیر فایل: src/middleware.ts (نسخه نهایی و کامل)

import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // مسیرهای API که نیاز به احراز هویت ندارند را از اینجا عبور می‌دهیم
  const publicApiRoutes = [
    "/api/auth",
    "/api/cron", // کران جاب نباید نیاز به لاگین داشته باشد
  ];

  if (publicApiRoutes.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // گرفتن توکن کاربر
  const token = await getToken({ req: request });

  // اگر کاربر توکن ندارد و تلاش می‌کند به یک مسیر محافظت‌شده دسترسی پیدا کند...
  if (!token) {
    // برای API ها، خطای Unauthorized برمی‌گردانیم
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // برای صفحات، کاربر را به صفحه لاگین هدایت می‌کنیم
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ++ اصلاحیه کلیدی: حذف کامل منطق بررسی token.role ++
  // کنترل دسترسی دقیق (Admin, USER) اکنون در لایه API و کنترلرها انجام می‌شود.
  // middleware فقط وظیفه حفاظت کلی از مسیرها را بر عهده دارد.

  return NextResponse.next();
}

export const config = {
  matcher: [
    // تمام مسیرهای داشبورد، پنل و API (به جز موارد عمومی) را محافظت می‌کنیم
    "/dashboard/:path*",
    "/panel/:path*",
    "/api/((?!auth|cron).*)",
  ],
};
