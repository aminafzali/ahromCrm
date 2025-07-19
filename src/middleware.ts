// مسیر فایل: src/middleware.ts (نسخه نهایی و کامل)

import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // مسیرهای عمومی API که هرگز نیاز به احراز هویت ندارند
  const publicApiRoutes = ["/api/auth", "/api/cron"];
  if (publicApiRoutes.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // گرفتن توکن کاربر از کوکی‌ها
  const token = await getToken({ req: request });

  const isAuthPage = pathname.startsWith('/login');

  // سناریو ۱: کاربر لاگین کرده و تلاش می‌کند به صفحه لاگین برود
  if (token && isAuthPage) {
    // او را به صفحه انتخاب ورک‌اسپیس هدایت کن
    return NextResponse.redirect(new URL("/select-workspace", request.url));
  }

  // سناریو ۲: کاربر لاگین نکرده و تلاش می‌کند به یک مسیر محافظت‌شده دسترسی پیدا کند
  if (!token && !isAuthPage) {
    // برای API ها، خطای Unauthorized برمی‌گردانیم
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // برای صفحات، کاربر را به صفحه لاگین هدایت می‌کنیم
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // در غیر این صورت (کاربر لاگین کرده و به مسیر درستی می‌رود)، اجازه عبور می‌دهیم
  return NextResponse.next();
}

export const config = {
  matcher: [
    // تمام مسیرهای حساس برنامه را در اینجا تعریف می‌کنیم
    "/dashboard/:path*",
    "/panel/:path*",
    "/select-workspace",
    "/workspaces/:path*",
    "/api/((?!auth|cron).*)", // تمام API ها به جز auth و cron
  ],
};