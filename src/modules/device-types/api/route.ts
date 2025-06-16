// src/modules/device-types/api/route.ts

import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { DeviceTypeServiceApi } from "../service/DeviceTypeServiceApi";

const service = new DeviceTypeServiceApi();

/**
 * کنترلر اختصاصی برای ماژول انواع دستگاه
 * این کلاس، سرویس و آبجکت include را به BaseController ارسال می‌کند.
 */
class DeviceTypeController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new DeviceTypeController();

/**
 * دریافت لیست انواع دستگاه
 */
export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

/**
 * ایجاد یک نوع دستگاه جدید
 */
export async function POST(req: NextRequest) {
  return controller.create(req);
}
