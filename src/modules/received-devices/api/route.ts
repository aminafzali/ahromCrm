// src/modules/received-devices/api/route.ts

import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { ReceivedDevice } from "@prisma/client";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { ReceivedDeviceServiceApi } from "../service/ReceivedDeviceServiceApi"; // مسیر سرویس را در صورت نیاز اصلاح کنید

// ===================================================================
// ▼▼▼ کنترلر اختصاصی با منطق بازنویسی شده برای فیلتر وضعیت ▼▼▼
// ===================================================================
class ReceivedDeviceController extends BaseController<ReceivedDevice> {
  constructor() {
    super(new ReceivedDeviceServiceApi(), include);
  }

  /**
   * ما فقط این متد کوچک را بازنویسی می‌کنیم تا منطق فیلترینگ خاص خود را اعمال کنیم.
   */
  protected transformFilters(params: any): any {
    // چک می‌کنیم آیا فیلتر statusId از کلاینت ارسال شده است یا نه
    if (params.filters.statusId) {
      // آن را به یک فیلتر تو در تو برای مدل Request تبدیل می‌کنیم
      // (فرض بر اینکه مدل ReceivedDevice رابطه‌ای به نام request دارد)
      params.filters.request = {
        statusId: params.filters.statusId,
      };

      // فیلتر اصلی و اضافی را حذف می‌کنیم تا پریزما خطا ندهد
      delete params.filters.statusId;
    }

    // پارامترهای تبدیل شده را برمی‌گردانیم
    return params;
  }
}
// ===================================================================

const controller = new ReceivedDeviceController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}
export async function POST(req: NextRequest) {
  return controller.create(req);
}
