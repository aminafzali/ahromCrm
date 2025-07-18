// مسیر فایل: src/app/api/workspaces/route.ts
import { UnauthorizedException } from "@/@Server/Exceptions/BaseException";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { WorkspaceApiService } from "@/@Server/services/workspaces/WorkspaceApiService";
import { NextRequest, NextResponse } from "next/server";

const service = new WorkspaceApiService();

// GET برای لیست ورک‌اسپیس‌های کاربر استفاده نمی‌شود (از /api/user/workspaces استفاده می‌کنیم)
// این POST فقط برای ساخت ورک‌اسپیس جدید است
export async function POST(req: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(req, true, false); // بدون نیاز به ورک‌اسپیس
    if (!context.user) {
      throw new UnauthorizedException("User not authenticated.");
    }
    const body = await req.json();
    const data = await service.create(body, context);
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: error.statusCode || 500 }
    );
  }
}
