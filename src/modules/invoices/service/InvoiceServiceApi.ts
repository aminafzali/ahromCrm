import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { InventoryServiceApi } from "@/modules/inventory/service/InventoryServiceApi";
import { NotificationServiceApi } from "@/modules/notifications/service/NotificationServiceApi";
import { SalesNotificationHelper } from "@/modules/sales-notifications/service/SalesNotificationHelper";
import {
  InvoicePaymentStatus,
  InvoiceStatus,
  StockMovementType,
} from "@prisma/client";
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
  protected inventoryService: InventoryServiceApi;
  protected salesNotificationHelper: SalesNotificationHelper;

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
    this.inventoryService = new InventoryServiceApi();
    this.salesNotificationHelper = new SalesNotificationHelper();

    // Initialize hooks
    this.afterCreate = this.handleAfterCreate;
    this.beforeUpdate = this.handleBeforeUpdate;
    this.afterUpdate = this.handleAfterUpdate;
  }

  /**
   * Handle after create hook
   */
  private async handleAfterCreate(entity: any): Promise<void> {
    try {
      await this.salesNotificationHelper.notifyInvoiceCreated(
        entity.id,
        entity.workspaceId
      );
    } catch (error) {
      console.error(
        `[InvoiceService] Failed to send notifications for invoice ${entity.id}:`,
        error
      );
    }

    // واکشی فاکتور با اطلاعات workspaceUser برای اعلان legacy (request-based)
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

  /**
   * Hook قبل از آپدیت: ذخیره وضعیت قبلی فاکتور برای مقایسه
   */
  private async handleBeforeUpdate(
    id: number | string,
    data: any
  ): Promise<any> {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    const oldInvoice = await prisma.invoice.findUnique({
      where: { id: numericId },
      include: { items: true },
    });

    // ذخیره وضعیت قبلی در data برای استفاده در afterUpdate
    if (oldInvoice) {
      (data as any)._oldInvoiceStatus = oldInvoice.invoiceStatus;
      (data as any)._oldInvoice = oldInvoice;
    }

    return data;
  }

  /**
   * Hook بعد از آپدیت: بررسی تغییر وضعیت فاکتور و به‌روزرسانی موجودی
   */
  private async handleAfterUpdate(entity: any): Promise<void> {
    const invoice = await this.getById(entity.id, {
      include: {
        items: {
          include: {
            product: true,
          },
        },
        workspaceUser: {
          include: {
            user: true,
          },
        },
      },
    });

    // بررسی اینکه آیا وضعیت فاکتور به APPROVED تغییر کرده است
    const oldStatus = (entity as any)._oldInvoiceStatus;
    const newStatus = invoice.invoiceStatus;

    if (
      oldStatus !== InvoiceStatus.APPROVED &&
      newStatus === InvoiceStatus.APPROVED
    ) {
      // فاکتور تایید شده است - باید موجودی را به‌روزرسانی کنیم
      await this.updateInventoryForInvoice(invoice);
    } else if (
      oldStatus === InvoiceStatus.APPROVED &&
      newStatus !== InvoiceStatus.APPROVED
    ) {
      // فاکتور از APPROVED خارج شده - باید موجودی را برگردانیم (معکوس کنیم)
      await this.reverseInventoryForInvoice(invoice);
    }

    // ارسال اعلان پرداخت فاکتور
    // نکته: paymentStatus جداست و باید آن را چک کنیم نه invoiceStatus
    const oldPaymentStatus = (entity as any)._oldInvoice?.paymentStatus;
    const newPaymentStatus = invoice.paymentStatus;

    if (
      oldPaymentStatus !== InvoicePaymentStatus.PAID &&
      newPaymentStatus === InvoicePaymentStatus.PAID
    ) {
      try {
        await this.salesNotificationHelper.notifyInvoicePaid(
          invoice.id,
          invoice.workspaceId
        );
      } catch (error) {
        console.error(
          `[InvoiceService] Failed to send payment notification for invoice ${invoice.id}:`,
          error
        );
      }
    }
  }

  /**
   * به‌روزرسانی موجودی بر اساس فاکتور تایید شده
   */
  private async updateInventoryForInvoice(invoice: any): Promise<void> {
    if (!invoice.items || invoice.items.length === 0) {
      return;
    }

    // تعیین نوع حرکت بر اساس نوع فاکتور
    let movementType: StockMovementType;
    let quantityMultiplier: number;

    if (invoice.type === "PURCHASE" || invoice.type === "RETURN_SALES") {
      // فاکتور خرید یا مرجوعی فروش = ورود کالا
      movementType = StockMovementType.PURCHASE;
      quantityMultiplier = 1;
    } else if (invoice.type === "SALES" || invoice.type === "RETURN_PURCHASE") {
      // فاکتور فروش یا مرجوعی خرید = خروج کالا
      movementType = StockMovementType.SALE;
      quantityMultiplier = -1;
    } else {
      // سایر انواع فاکتور (PROFORMA) نیازی به به‌روزرسانی موجودی ندارند
      return;
    }

    // پیدا کردن انبار پیش‌فرض برای این workspace
    // در صورت نیاز می‌توانی از یک فیلد در Invoice یا تنظیمات workspace استفاده کنی
    const defaultWarehouse = await prisma.warehouse.findFirst({
      where: { workspaceId: invoice.workspaceId },
    });

    if (!defaultWarehouse) {
      console.warn(
        `[InvoiceService] No warehouse found for workspace ${invoice.workspaceId}. Skipping inventory update.`
      );
      return;
    }

    // به‌روزرسانی موجودی برای هر آیتم
    for (const item of invoice.items) {
      if (item.itemType === "PRODUCT" && item.productId) {
        const quantity = item.quantity * quantityMultiplier;

        await this.inventoryService.adjustStock(
          {
            workspaceId: invoice.workspaceId,
            warehouseId: defaultWarehouse.id,
            productId: item.productId,
            quantity,
            movementType,
            invoiceId: invoice.id,
            description: `فاکتور ${invoice.type} - شماره ${invoice.invoiceNumberName}`,
          },
          undefined
        );
      }
    }
  }

  /**
   * برگرداندن موجودی (معکوس کردن) وقتی فاکتور از APPROVED خارج می‌شود
   */
  private async reverseInventoryForInvoice(invoice: any): Promise<void> {
    if (!invoice.items || invoice.items.length === 0) {
      return;
    }

    const defaultWarehouse = await prisma.warehouse.findFirst({
      where: { workspaceId: invoice.workspaceId },
    });

    if (!defaultWarehouse) {
      return;
    }

    // معکوس کردن حرکت‌های قبلی
    for (const item of invoice.items) {
      if (item.itemType === "PRODUCT" && item.productId) {
        // پیدا کردن حرکت‌های قبلی برای این فاکتور
        const movements = await prisma.stockMovement.findMany({
          where: {
            invoiceId: invoice.id,
            productId: item.productId,
            warehouseId: defaultWarehouse.id,
          },
        });

        // معکوس کردن هر حرکت
        for (const movement of movements) {
          await this.inventoryService.adjustStock(
            {
              workspaceId: invoice.workspaceId,
              warehouseId: defaultWarehouse.id,
              productId: item.productId,
              quantity: -movement.quantity, // معکوس
              movementType: movement.movementType,
              description: `برگرداندن موجودی - فاکتور ${invoice.invoiceNumberName}`,
            },
            undefined
          );
        }
      }
    }
  }
}
