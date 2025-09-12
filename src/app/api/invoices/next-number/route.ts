import { ApiResponse } from "@/@Server/Http/Response/ApiResponse";
import { InvoiceServiceApi } from "@/modules/invoices/service/InvoiceServiceApi";
import { NextRequest } from "next/server";

// یک نمونه از سرویس فاکتور ساخته می‌شود
const service = new InvoiceServiceApi();

/**
 * این تابع به درخواست‌های GET به آدرس /api/invoices/next-number پاسخ می‌دهد.
 * متد getNextInvoiceNumber از سرویس را فراخوانی کرده و شماره فاکتور بعدی را برمی‌گرداند.
 */
export async function GET(req: NextRequest) {
  try {
    const nextInvoiceNumber = await service.getNextInvoiceNumber();
    return ApiResponse.success({ invoiceNumber: nextInvoiceNumber });
  } catch (error) {
    // در صورت بروز خطا، یک پاسخ خطای استاندارد برمی‌گرداند
    return ApiResponse.error("Failed to retrieve next invoice number");
  }
}
