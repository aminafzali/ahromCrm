// مسیر فایل: src/middleware.ts

import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const publicApiRoutes = [
    "/api/auth",
    "/api/cron",
    "/api/public/requests",
    "/api/support-chat/public",
  ];

  if (publicApiRoutes.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });
  const isAuthPage = pathname.startsWith("/login");

  if (token && isAuthPage) {
    // ++ اصلاحیه: هدایت به آدرس جدید و صحیح ++
    return NextResponse.redirect(new URL("/workspaces", request.url));
  }

  if (!token && !isAuthPage) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/panel/:path*",
    // ++ اصلاحیه: اضافه کردن مسیرهای جدید به بخش محافظت‌شده ++
    "/workspaces/:path*",
    "/api/:path*",
    "/api/((?!auth|cron).*)",
  ],
};
