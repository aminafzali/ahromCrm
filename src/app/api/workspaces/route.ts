// مسیر فایل: src/app/api/workspaces/route.ts

import { UnauthorizedException } from "@/@Server/Exceptions/BaseException";
import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { include } from "@/modules/workspaces/data/fetch";
import { WorkspaceApiService } from "@/modules/workspaces/service/WorkspaceApiService";
import { NextRequest, NextResponse } from "next/server";

const service = new WorkspaceApiService();

class WorkspaceController extends BaseController<any> {
  constructor() {
    super(service, include, false);
  }

  // ما متد create را بازنویسی می‌کنیم تا منطق خاص خود را داشته باشد
  async create(req: NextRequest): Promise<NextResponse> {
    return this.executeAction(req, async () => {
      // به AuthProvider می‌گوییم که کاربر باید لاگین باشد، اما نیازی به ورک‌اسپیس ندارد
      const context = await AuthProvider.isAuthenticated(req, true, false);
      if (!context.user) {
        throw new UnauthorizedException(
          "User context is required for creation."
        );
      }

      const body = await req.json();

      // ما context را به سرویس پاس می‌دهیم تا بتواند ownerId را از آن استخراج کند
      const data = await this.service.create(body, context);
      return this.created({ message: "Workspace created successfully", data });
    });
  }
}

const controller = new WorkspaceController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}
