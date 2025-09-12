import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { InvoiceType } from "@prisma/client";
import { InvoiceWithRelations } from "../types";

export class InvoiceRepository extends BaseRepository<
  InvoiceWithRelations,
  number
> {
  constructor() {
    super("invoices");
  }
/**
   * شماره فاکتور بعدی را بر اساس نوع فاکتور از سرور دریافت می‌کند.
   * @param type نوع فاکتور (e.g., SALES, PURCHASE)
   */
  public async getNextInvoiceNumber(type: InvoiceType): Promise<{ invoiceNumber: number; invoiceNumberName: string }> {
    // نوع فاکتور را به عنوان کوئری پارامتر به API ارسال می‌کنیم
    const endpoint = `invoices/next-number?type=${type}`;

    const result = await this.get<{ invoiceNumber: number; invoiceNumberName: string }>(endpoint);

    // پاسخ سرور شامل شماره عددی و نام نمایشی خواهد بود
    return result;
  }
  
}

// import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
// import { InvoiceWithRelations } from "../types";
// import { InvoiceType } from "@prisma/client";

// // Define the structure of the API response for the next invoice number.
// // This helps with type safety.
// interface NextNumberResponse {
//   success: boolean;
//   message: string;
//   data: {
//     invoiceNumber: number;
//   };
// }
// // دیکشنری برای نگاشت نوع فاکتور به پیشوند شماره آن
// const InvoiceTypePrefix: Record<InvoiceType, string> = {
//   SALES: "S-",
//   PURCHASE: "P-",
//   PROFORMA: "PF-",
//   RETURN_SALES: "RS-",
//   RETURN_PURCHASE: "RP-",
// };

// export class InvoiceRepository extends BaseRepository<
//   InvoiceWithRelations,
//   number
// > {
//   constructor() {
//     super("invoices");
//   }

//   /**
//    * شماره فاکتور بعدی را از سرور دریافت می‌کند.
//    */
//   public async getNextInvoiceNumber(): Promise<{ invoiceNumber: number }> {
//     const endpoint = "invoices/next-number";

//     // --- START: FIX ---
//     // راه‌حل: ما فرض می‌کنیم که متد this.get به صورت خودکار محتوای پراپرتی 'data'
//     // از پاسخ API را برمی‌گرداند. بنابراین، دیگر نیازی به دسترسی مجدد به result.data نیست.
//     // ما نوع داده مورد انتظار را مستقیماً به get پاس می‌دهیم.
//     const result = await this.get<{ invoiceNumber: number }>(endpoint);

//     // خود 'result' حالا باید آبجکت { invoiceNumber: 18 } باشد.
//     return result;
//     // --- END: FIX ---
//   }
// }
