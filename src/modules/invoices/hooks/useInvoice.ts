import { useCrud } from "@/@Client/hooks/useCrud";
import { InvoiceType } from "@prisma/client";
import { z } from "zod";
import { InvoiceRepository } from "../repo/InvoiceRepository";
import { InvoiceWithRelations } from "../types";
import { createInvoiceSchema, updateInvoiceSchema } from "../validation/schema";

export function useInvoice() {
  const invoiceRepo = new InvoiceRepository();
  const hook = useCrud<
    InvoiceWithRelations,
    z.infer<typeof createInvoiceSchema>,
    z.infer<typeof updateInvoiceSchema>
  >(invoiceRepo);

  // /**
  //  * Fetches the next invoice number using the repository instance.
  //  */
  // const fetchNextInvoiceNumber = async () => {
  //   try {
  //     const data = await invoiceRepo.getNextInvoiceNumber();
  //     return data.invoiceNumber;
  //   } catch (error) {
  //     console.error("Failed to fetch next invoice number", error);
  //     return 1; // Fallback value
  //   }
  // };

  /**
   * شماره فاکتور بعدی را بر اساس نوع آن از سرور دریافت می‌کند.
   */
  const fetchNextInvoiceNumber = async (type: InvoiceType) => {
    try {
      // FIX: نوع فاکتور به ریپازیتوری پاس داده می‌شود
      const data = await invoiceRepo.getNextInvoiceNumber(type);
      return data; // آبجکت کامل شامل شماره و نام نمایشی را برمی‌گرداند
    } catch (error) {
      console.error("Failed to fetch next invoice number", error);
      // در صورت خطا، یک مقدار پیش‌فرض برمی‌گردانیم
      return { invoiceNumber: 1001, invoiceNumberName: "" };
    }
  };

  return {
    ...hook,
    fetchNextInvoiceNumber,
  };
}
