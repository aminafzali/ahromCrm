// مسیر فایل: src/app/api/public/requests/route.ts

import { RequestServiceApi } from "@/modules/requests/service/RequestServiceApi";
import { NextResponse } from "next/server";

/**
 * این API Route، ورودی عمومی برای ثبت درخواست‌هاست.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const requestService = new RequestServiceApi();

    // تمام منطق پیچیده را به خود سرویس می‌سپاریم
    const newRequest = await requestService.createPublicRequest(body);

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error: any) {
    console.error("API Error - /api/public/requests:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
