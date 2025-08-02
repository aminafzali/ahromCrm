// import { BaseController } from "@/@Server/Http/Controller/BaseController";
// import { NextRequest } from "next/server";
// import { include } from "../../../data/fetch";
// import { RequestServiceApi } from "../../../service/RequestServiceApi";

// const service = new RequestServiceApi();

// class RequestController extends BaseController<any> {
//   constructor() {
//     super(service, include);
//   }
// }

// const controller = new RequestController();

// export async function PATCH(
//   req: NextRequest, id : number // ✅ Correct format
// ) {
//   return controller.updateStatus(req, id); // ✅ Convert id to number
// }

// مسیر فایل: src/modules/requests/api/id/update-status/route.ts
// مسیر فایل: src/modules/requests/api/id/update-status/route.ts

import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest, NextResponse } from "next/server";
import { include } from "../../../data/fetch"; // مسیر صحیح برای دسترسی به فایل
import { RequestServiceApi } from "../../../service/RequestServiceApi"; // مسیر صحیح برای دسترسی به فایل

const service = new RequestServiceApi();

class RequestController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new RequestController();

export async function PATCH(
  req: NextRequest,
  id: any // ما تایپ را به any تغییر می‌دهیم تا ببینیم Next.js واقعاً چه مقداری را به این پارامتر پاس می‌دهد
) {
  // ===== شروع لاگ‌های ردیابی =====
  console.log(
    `%c[API Route - /update-status] 1. PATCH handler in route.ts was hit.`,
    "color: #8A2BE2; font-weight: bold;"
  );
  console.log(
    `[API Route - /update-status]    - Value of 'req' object is available.`
  );
  console.log(`[API Route - update-status]    - Value of 'id' parameter:`, id);
  console.log(
    `[API Route - update-status]    - Type of 'id' parameter:`,
    typeof id
  );
  console.log(
    `[API Route - update-status] 2. Calling controller.updateStatus with received parameters...`
  );
  // ===== پایان لاگ‌های ردیابی =====

  try {
    console.log(
      `[API Route - /update-status] 2. Calling controller.updateStatus...`
    );

    // ما منتظر می‌مانیم تا پاسخ از کنترلر برگردد
    const response = await controller.updateStatus(req, id);

    // اگر عملیات موفق بود، پاسخ را لاگ می‌کنیم
    console.log(
      `%c[API Route - /update-status] 3. ✅ controller.updateStatus finished successfully.`,
      "color: #28a745; font-weight: bold;"
    );
    console.log(
      `[API Route - /update-status]    - Returning response with status: ${response.status}`
    );

    return response;
  } catch (error) {
    // اگر در هر مرحله‌ای از executeAction یا سرویس خطایی رخ دهد، در اینجا آن را می‌گیریم
    console.error(
      `%c[API Route - /update-status] 4. ❌ An error was caught in the route handler!`,
      "color: #dc3545; font-weight: bold;"
    );
    console.error("[API Route - /update-status]    - Error object:", error);

    // یک پاسخ خطای استاندارد و تمیز برمی‌گردانیم
    return NextResponse.json(
      { error: "An unexpected error occurred in the route handler." },
      { status: 500 }
    );
  }
  // ===== پایان بلوک try...catch =====
}
