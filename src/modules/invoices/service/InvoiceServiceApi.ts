import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { NotificationServiceApi } from "@/modules/notifications/service/NotificationServiceApi";
import { relations, searchFileds } from "../data/fetch";
import { createInvoiceSchema } from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("Invoice");
  }
}

export class InvoiceServiceApi extends BaseService<any> {
  protected notifRepo: NotificationServiceApi;

  constructor() {
    super(
      new Repository(),
      createInvoiceSchema,
      createInvoiceSchema,
      searchFileds,
      relations
    );
    this.repository = new Repository();
    this.notifRepo = new NotificationServiceApi();

    // Initialize hooks
    this.afterCreate = this.handleAfterCreate;
    // this.afterStatusChange = this.handleAfterStatusChange;
  }

  /**
  //  * Handle after create hook
  //  */
  private async handleAfterCreate(entity: any): Promise<void> {
    const invoice = await this.getById(entity.id, {
      include: {
        request: true,
      },
    });
    let baseLink: string = process.env.NEXTAUTH_URL
      ? process.env.NEXTAUTH_URL
      : "http://localhost:3011";
    baseLink += "/panel/invoices/" + entity.id;
    const message =
      `یک فاکتور برای شما ثبت شد` + "\n" + "شماره پیگیری :‌ " + entity.id;
    // Create initial status notification
    //todo:t3 نیاز به اصلاحیه جدی
    // await this.notifRepo.create({
    //   userId: invoice.userId,
    //   title: "ثبت فاکتور",
    //   message,
    // });
  }

  // /**
  //  * Handle after create hook
  //  */
  // private async handleAfterCreate(entity: any): Promise<void> {
  //   const request = await prisma.request.findUnique({
  //     where: { id: entity.requestId },
  //     include: { user: true }
  //   });

  //   if (!request) return;

  //   // Create notification for user
  //   await prisma.notification.create({
  //     data: {
  //       userId: request.userId,
  //       title: "صدور صورتحساب",
  //       message: "صورتحساب درخواست شما صادر شد.",
  //       requestId: request.id
  //     }
  //   });

  //   // Create note
  //   await prisma.note.create({
  //     data: {
  //       requestId: request.id,
  //       content: `صورتحساب به مبلغ ${entity.total.toLocaleString()} تومان صادر شد.`
  //     }
  //   });
  // }

  // /**
  //  * Handle status change hook
  //  */
  // private async handleAfterStatusChange(event: StatusChangeEvent): Promise<void> {
  //   const { entityId, newStatus } = event;
  //   const invoice = await prisma.invoice.findUnique({
  //     where: { id: entityId as number },
  //     include: { request: true }
  //   });

  //   if (!invoice) return;

  //   // Handle payment status change
  //   if (newStatus === "پرداخت شده") {
  //     // Create notification
  //     await prisma.notification.create({
  //       data: {
  //         userId: invoice.request.userId,
  //         title: "پرداخت موفق",
  //         message: "پرداخت صورتحساب شما با موفقیت انجام شد.",
  //         requestId: invoice.requestId
  //       }
  //     });

  //     // Create note
  //     await prisma.note.create({
  //       data: {
  //         requestId: invoice.requestId,
  //         content: `پرداخت صورتحساب به مبلغ ${invoice.total.toLocaleString()} تومان با موفقیت انجام شد.`
  //       }
  //     });
  //   }
  // }
}
