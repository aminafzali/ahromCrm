import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { NotificationServiceApi } from "@/modules/notifications/service/NotificationServiceApi";
import { InvoicePaymentStatus } from "@prisma/client";
import { connects, relations, searchFileds } from "../data/fetch";
import { createPaymentSchema } from "../validation/schema";
class Repository extends BaseRepository<any> {
  constructor() {
    super("Payment");
  }
}

export class PaymentServiceApi extends BaseService<any> {
  protected notifRepo: NotificationServiceApi;

  constructor() {
    super(
      new Repository(),
      createPaymentSchema,
      createPaymentSchema,
      searchFileds,
      relations
    );
    this.connect = connects;
    this.repository = new Repository();
    this.notifRepo = new NotificationServiceApi();

    // Initialize hooks
    this.afterCreate = this.handleAfterCreate;
  }

  /**
   * Handle after create hook
   */
  private async handleAfterCreate(entity: any): Promise<void> {
    // --- START: منطق آپدیت خودکار و هوشمند وضعیت پرداخت فاکتور ---
    if (entity.invoiceId) {
      try {
        const invoice = await prisma.invoice.findUnique({
          where: { id: entity.invoiceId },
          include: { payments: true },
        });

        if (invoice) {
          // جدا کردن پرداخت‌ها به دریافتی و پرداختی
          const receives = invoice.payments
            .filter((p) => p.type === "RECEIVE")
            .reduce((sum, p) => sum + p.amount, 0);
          const pays = invoice.payments
            .filter((p) => p.type === "PAY")
            .reduce((sum, p) => sum + p.amount, 0);

          let netPaid = 0;
          const invoiceType = invoice.type;

          // منطق محاسبه بر اساس نوع فاکتور
          if (invoiceType === "SALES" || invoiceType === "RETURN_PURCHASE") {
            // برای فاکتور فروش و مرجوعی خرید، دریافتی‌ها مثبت و پرداختی‌ها (مرجوعی وجه) منفی هستند
            netPaid = receives - pays;
          } else if (
            invoiceType === "PURCHASE" ||
            invoiceType === "RETURN_SALES"
          ) {
            // برای فاکتور خرید و مرجوعی فروش، پرداختی‌ها مثبت و دریافتی‌ها (عودت وجه) منفی هستند
            netPaid = pays - receives;
          }

          const totalAmount = invoice.total;
          let newStatus: InvoicePaymentStatus;

          if (netPaid <= 0) {
            newStatus = "UNPAID";
          } else if (netPaid < totalAmount) {
            newStatus = "PARTIALLY_PAID";
          } else if (netPaid === totalAmount) {
            newStatus = "PAID";
          } else {
            // netPaid > totalAmount
            newStatus = "OVERPAID";
          }

          if (invoice.paymentStatus !== newStatus) {
            await prisma.invoice.update({
              where: { id: entity.invoiceId },
              data: { paymentStatus: newStatus },
            });
          }
        }
      } catch (error) {
        console.error("Failed to update invoice payment status:", error);
      }
    }
    // --- END: منطق آپدیت خودکار ---

    let baseLink: string = process.env.NEXTAUTH_URL
      ? process.env.NEXTAUTH_URL
      : "http://localhost:3011";
    baseLink += "/panel/payments/" + entity.id;
    const message =
      `پرداخت شما با موفقیت انجام شد` +
      "\n" +
      "شماره پیگیری :‌ " +
      entity.reference;

    // Create notification
    //todo:t3 نیاز به اصلاحیه جدی
    // await this.notifRepo.create({
    //   userId: entity.userId,
    //   title: "پرداخت موفق",
    //   message,
    // });
  }
}
