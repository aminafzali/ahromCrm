import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { InvoiceWithRelations } from "../types";

// Define the structure of the API response for the next invoice number.
// This helps with type safety.
interface NextNumberResponse {
  success: boolean;
  message: string;
  data: {
    invoiceNumber: number;
  };
}

export class InvoiceRepository extends BaseRepository<
  InvoiceWithRelations,
  number
> {
  constructor() {
    super("invoices");
  }

  /**
   * شماره فاکتور بعدی را از سرور دریافت می‌کند.
   */
  public async getNextInvoiceNumber(): Promise<{ invoiceNumber: number }> {
    const endpoint = "invoices/next-number";

    // --- START: FIX ---
    // راه‌حل: ما فرض می‌کنیم که متد this.get به صورت خودکار محتوای پراپرتی 'data'
    // از پاسخ API را برمی‌گرداند. بنابراین، دیگر نیازی به دسترسی مجدد به result.data نیست.
    // ما نوع داده مورد انتظار را مستقیماً به get پاس می‌دهیم.
    const result = await this.get<{ invoiceNumber: number }>(endpoint);

    // خود 'result' حالا باید آبجکت { invoiceNumber: 18 } باشد.
    return result;
    // --- END: FIX ---
  }
}
