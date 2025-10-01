import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { NotificationServiceApi } from "@/modules/notifications/service/NotificationServiceApi";
import { connect, relations, searchFileds } from "../data/fetch";
import { createInvoiceSchema, updateInvoiceSchema } from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("Invoice");
  }
  /**
   * یک متد عمومی برای دسترسی به قابلیت findFirst پریزما.
   * این متد ضروری است چون getter 'model' در BaseRepository به صورت protected تعریف شده
   * و ما نمی‌توانیم مستقیماً از داخل کلاس Service به آن دسترسی داشته باشیم.
   * این متد به 'this.model' دسترسی دارد چون کلاس Repository یک زیرکلاس (subclass) از BaseRepository است.
   * @param args - آرگومان‌های کوئری برای findFirst پریزما (مثل orderBy, where).
   */
  public findFirst(args: any) {
    return this.model.findFirst(args);
  }
}

export class InvoiceServiceApi extends BaseService<any> {
  protected notifRepo: NotificationServiceApi;

  constructor() {
    const repository = new Repository(); // یک نمونه از ریپازیتوری سفارشی خودمان می‌سازیم
    super(
      repository,
      createInvoiceSchema,
      updateInvoiceSchema,
      searchFileds,
      relations
    );
    this.connect = connect;
    this.repository = repository;
    this.notifRepo = new NotificationServiceApi();

    // Initialize hooks
    this.afterCreate = this.handleAfterCreate;
    // this.afterStatusChange = this.handleAfterStatusChange;
  }

  /**
  //  * Handle after create hook
  //  */
  private async handleAfterCreate(entity: any): Promise<void> {
    // واکشی فاکتور با اطلاعات workspaceUser
    const invoice = await this.getById(entity.id, {
      include: {
        request: {
          include: {
            workspaceUser: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    // بررسی وجود workspaceUser
    const customer = invoice.request?.workspaceUser;
    if (!customer) {
      console.warn(
        `[InvoiceService] workspaceUser not found for invoice ${entity.id}`
      );
      return;
    }

    let baseLink: string = process.env.NEXTAUTH_URL
      ? process.env.NEXTAUTH_URL
      : "http://localhost:3011";
    baseLink += "/panel/invoices/" + entity.id;

    const message = `یک فاکتور برای شما ثبت شد\nشماره پیگیری: ${entity.id}\nلینک: ${baseLink}`;

    // ساخت context مشابه RequestServiceApi
    const context = {
      workspaceId: entity.workspaceId,
      user: customer.user,
    } as AuthContext;

    // ارسال نوتیفیکیشن به workspaceUser
    await this.notifRepo.create(
      {
        workspaceUser: customer,
        requestId: invoice.request?.id,
        title: "ثبت فاکتور",
        message,
      },
      context
    );
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
