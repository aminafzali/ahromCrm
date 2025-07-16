// مسیر فایل: src/modules/workspaces/api/route.ts

import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { WorkspaceApiService } from "../service/WorkspaceApiService";

const service = new WorkspaceApiService();

class WorkspaceController extends BaseController<any> {
  constructor() {
    // در اینجا own را false می‌گذاریم تا ادمین‌ها بتوانند همه ورک‌اسپیس‌ها را ببینند
    // اما منطق اصلی کنترل دسترسی در خود AuthProvider و BaseController اعمال می‌شود
    super(service, include, false);
  }
}

const controller = new WorkspaceController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}
