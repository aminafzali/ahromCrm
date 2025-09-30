// مسیر فایل: src/lib/auth.ts (نسخه نهایی و کامل)

import { getServerSession } from "next-auth/next";
import { authOptions } from "./authOptions";

/**
 * یک هلپر ساده برای دریافت آبجکت کامل session در سمت سرور.
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * یک هلپر ساده برای دریافت آبجکت user از داخل session.
 * توجه: این آبجکت user، شامل نقش‌های ورک‌اسپیسی نمی‌باشد.
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

// -----------------------------------------------------------------------------
// DEPRECATED MIDDLEWARE FUNCTIONS
// -----------------------------------------------------------------------------
// توابع زیر با معرفی سیستم ورک‌اسپیس، منسوخ شده‌اند.
// تمام منطق کنترل دسترسی اکنون به صورت متمرکز و هوشمند
// در src/@Server/Providers/AuthProvider.ts
// و src/@Server/Http/Controller/BaseController.ts
// مدیریت می‌شود.
// -----------------------------------------------------------------------------

/*
// Middleware to check if user is authenticated
// DEPRECATED: Use AuthProvider.isAuthenticated(req) instead.
export async function isAuthenticated(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  return handler(req);
}

// Middleware to check if user is admin
// DEPRECATED: Use AuthProvider.isAdmin(req) instead.
export async function isAdmin(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // This logic is now incorrect because "role" is workspace-specific.
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  return handler(req);
}
*/