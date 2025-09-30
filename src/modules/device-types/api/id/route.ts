// src/modules/device-types/api/id/route.ts

import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../../data/fetch";
import { DeviceTypeServiceApi } from "../../service/DeviceTypeServiceApi";

const service = new DeviceTypeServiceApi();

/**
 * کنترلر اختصاصی برای ماژول انواع دستگاه
 */
class DeviceTypeController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new DeviceTypeController();

/**
 * دریافت جزئیات یک نوع دستگاه
 * این تابع id را به صورت number دریافت می‌کند، زیرا تبدیل نوع در مسیر داینامیک مرکزی انجام شده است.
 */
export async function GET(req: NextRequest, id: number) {
  return controller.getById(req, id);
}

/**
 * به‌روزرسانی یک نوع دستگاه
 */
export async function PATCH(req: NextRequest, id: number) {
  return controller.update(req, id);
}

/**
 * حذف یک نوع دستگاه
 */
export async function DELETE(req: NextRequest, id: number) {
  return controller.delete(req, id);
}
