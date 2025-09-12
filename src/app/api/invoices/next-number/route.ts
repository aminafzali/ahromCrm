import { ApiResponse } from "@/@Server/Http/Response/ApiResponse";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { InvoiceType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

// این دیکشنری برای ساخت نام نمایشی شماره فاکتور استفاده می‌شود
const InvoiceTypePrefix: Record<InvoiceType, string> = {
  SALES: "S-",
  PURCHASE: "P-",
  PROFORMA: "PF-",
  RETURN_SALES: "RS-",
  RETURN_PURCHASE: "RP-",
};

export async function GET(req: NextRequest) {
  // session کاربر رو برای پیدا کردن workspaceId می‌خوانیم
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) {
    return ApiResponse.unauthorized();
  }
  const workspaceId = session.user.workspaceId;

  try {
    // FIX: نوع فاکتور را از پارامترهای URL می‌خوانیم
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as InvoiceType;

    // اگر نوع فاکتور ارسال نشده یا نامعتبر بود، خطا برمی‌گردانیم
    if (!type || !Object.values(InvoiceType).includes(type)) {
      return ApiResponse.badRequest("نوع فاکتور ارسال نشده یا نامعتبر است.");
    }

    // آخرین فاکتور از همان نوع در همان کسب‌وکار را پیدا می‌کنیم
    const lastInvoice = await prisma.invoice.findFirst({
      where: { workspaceId, type },
      orderBy: { invoiceNumber: "desc" },
    });

    const nextInvoiceNumber = lastInvoice
      ? lastInvoice.invoiceNumber + 1
      : 1001;
    const prefix = InvoiceTypePrefix[type];
    const invoiceNumberName = `${prefix}${nextInvoiceNumber}`;

    // شماره جدید و نام نمایشی آن را به کلاینت برمی‌گردانیم
    return ApiResponse.success({
      invoiceNumber: nextInvoiceNumber,
      invoiceNumberName,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to retrieve next invoice number";
    return ApiResponse.internalServerError(errorMessage, error);
  }
}

// import { ApiResponse } from "@/@Server/Http/Response/ApiResponse";
// import { InvoiceServiceApi } from "@/modules/invoices/service/InvoiceServiceApi";
// import { NextRequest } from "next/server";

// // یک نمونه از سرویس فاکتور ساخته می‌شود
// const service = new InvoiceServiceApi();

// /**
//  * این تابع به درخواست‌های GET به آدرس /api/invoices/next-number پاسخ می‌دهد.
//  * متد getNextInvoiceNumber از سرویس را فراخوانی کرده و شماره فاکتور بعدی را برمی‌گرداند.
//  */
// export async function GET(req: NextRequest) {
//   try {
//     const nextInvoiceNumber = await service.getNextInvoiceNumber();
//     return ApiResponse.success({ invoiceNumber: nextInvoiceNumber });
//   } catch (error) {
//     // در صورت بروز خطا، یک پاسخ خطای استاندارد برمی‌گرداند
//     return ApiResponse.error("Failed to retrieve next invoice number");
//   }
// }
