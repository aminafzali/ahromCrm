// src/modules/received-devices/api/route.ts

import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { ReceivedDevice } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { include } from "../data/fetch";
import { ReceivedDeviceServiceApi } from "../service/ReceivedDeviceServiceApi"; // مسیر سرویس را در صورت نیاز اصلاح کنید

// ===================================================================
// ▼▼▼ کنترلر اختصاصی با منطق بازنویسی شده برای فیلتر وضعیت ▼▼▼
// ===================================================================
class ReceivedDeviceController extends BaseController<ReceivedDevice> {
  constructor() {
    super(new ReceivedDeviceServiceApi(), include);
  }

  // ما متد getAll را بازنویسی می‌کنیم تا منطق فیلتر statusId را اضافه کنیم
  async getAll(req: NextRequest): Promise<NextResponse> {
    return this.executeAction(req, async () => {
      // از متد والد برای پارس کردن تمام پارامترهای دیگر استفاده می‌کنیم
      const params = this.parseQueryParams(req);

      // چک می‌کنیم آیا فیلتر statusId وجود دارد یا نه
      if (params.filters.statusId) {
        // آن را به یک فیلتر تو در تو برای مدل Request تبدیل می‌کنیم
        params.filters.request = {
          statusId: params.filters.statusId,
        };
        // فیلتر اصلی را حذف می‌کنیم تا پریزما خطا ندهد
        delete params.filters.statusId;
      }

      // سرویس را با پارامترهای اصلاح شده فراخوانی می‌کنیم
      const data = await this.service.getAll(params);
      return this.success(data);
    });
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
