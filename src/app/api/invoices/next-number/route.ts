import { ApiResponse } from "@/@Server/Http/Response/ApiResponse";
import prisma from "@/lib/prisma";
import { InvoiceType } from "@prisma/client";
import { NextRequest } from "next/server";

const InvoiceTypePrefix: Record<InvoiceType, string> = {
  SALES: "S-",
  PURCHASE: "P-",
  PROFORMA: "PF-",
  RETURN_SALES: "RS-",
  RETURN_PURCHASE: "RP-",
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as InvoiceType;
    const workspaceId = Number(searchParams.get("workspaceId")); // <<-- خواندن مستقیم از URL

    if (!workspaceId) {
      return ApiResponse.badRequest("شناسه کسب‌وکار ارسال نشده است.");
    }
    if (!type || !Object.values(InvoiceType).includes(type)) {
      return ApiResponse.badRequest("نوع فاکتور ارسال نشده یا نامعتبر است.");
    }

    const lastInvoice = await prisma.invoice.findFirst({
      where: { workspaceId, type },
      orderBy: { invoiceNumber: "desc" },
    });

    const nextInvoiceNumber = lastInvoice
      ? lastInvoice.invoiceNumber + 1
      : 1001;
    const prefix = InvoiceTypePrefix[type];
    const invoiceNumberName = `${prefix}${nextInvoiceNumber}`;

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
