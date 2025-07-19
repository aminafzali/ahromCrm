// مسیر فایل: src/app/api/workspaces/route.ts

import {
  BaseException,
  UnauthorizedException,
} from "@/@Server/Exceptions/BaseException";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { WorkspaceApiService } from "@/@Server/services/workspaces/WorkspaceApiService";
import { NextRequest, NextResponse } from "next/server";

const service = new WorkspaceApiService();

// این یک کنترلر ساده و مستقل است و از BaseController استفاده نمی‌کند
export async function POST(req: NextRequest) {
  try {
    // به AuthProvider می‌گوییم که کاربر باید لاگین باشد، اما نیازی به ورک‌اسپیس ندارد
    const context = await AuthProvider.isAuthenticated(req, true, false);
    if (!context.user) {
      throw new UnauthorizedException("User not authenticated.");
    }
    const body = await req.json();
    const data = await service.create(body, context);
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    if (error instanceof BaseException) {
      return NextResponse.json(
        { error: error.message, ...(error.errors && { errors: error.errors }) },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
