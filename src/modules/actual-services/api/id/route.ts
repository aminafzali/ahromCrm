// مسیر صحیح: src/modules/actual-services/api/id/route.ts

import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { include } from "@/modules/actual-services/data/fetch";
import { ActualServiceApi } from "@/modules/actual-services/service/ActualServiceApi";
import { NextRequest } from "next/server";

const service = new ActualServiceApi();

class ActualServiceController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new ActualServiceController();

// --- شروع اصلاحات ---
// امضای توابع دقیقاً مانند ماژول‌های دیگر اصلاح شد

export async function GET(req: NextRequest, id: number) {
  return controller.getById(req, id);
}

export async function PATCH(req: NextRequest, id: number) {
  return controller.update(req, id);
}

export async function DELETE(req: NextRequest, id: number) {
  return controller.delete(req, id);
}
// --- پایان اصلاحات ---
