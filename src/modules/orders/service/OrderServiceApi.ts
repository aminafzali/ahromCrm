import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { InventoryServiceApi } from "@/modules/inventory/service/InventoryServiceApi";
import { NotificationServiceApi } from "@/modules/notifications/service/NotificationServiceApi";
import { SalesNotificationHelper } from "@/modules/sales-notifications/service/SalesNotificationHelper";
import { OrderStatus, StockMovementType } from "@prisma/client";
import { connects, relations, searchFileds } from "../data/fetch";
import { createOrderSchema, updateOrderSchema } from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("Order");
  }
}

export class OrderServiceApi extends BaseService<any> {
  protected notifRepo: NotificationServiceApi;
  protected inventoryService: InventoryServiceApi;
  protected salesNotificationHelper: SalesNotificationHelper;

  constructor() {
    const repository = new Repository();
    super(
      repository,
      createOrderSchema,
      updateOrderSchema,
      searchFileds,
      relations
    );
    this.connect = connects;
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
   * Hook بعد از ایجاد سفارش: ارسال اعلان
   */
  private async handleAfterCreate(entity: any, data: any): Promise<void> {
    try {
      await this.salesNotificationHelper.notifyOrderCreated(
        entity.id,
        entity.workspaceId,
        data.workspaceUser.id
      );
    } catch (error) {
      console.error(
        `[OrderService] Failed to send notifications for order ${entity.id}:`,
        error
      );
    }
  }

  /**
   * Hook قبل از آپدیت: ذخیره وضعیت قبلی
   */
  private async handleBeforeUpdate(
    id: number | string,
    data: any
  ): Promise<any> {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    const oldOrder = await prisma.order.findUnique({
      where: { id: numericId },
    });

    if (oldOrder) {
      (data as any)._oldOrderStatus = oldOrder.status;
      (data as any)._oldOrder = oldOrder;
    }

    return data;
  }

  /**
   * Hook بعد از آپدیت: بررسی تغییر وضعیت و به‌روزرسانی موجودی
   */
  private async handleAfterUpdate(entity: any): Promise<void> {
    const order = await this.getById(entity.id, {
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

    const oldStatus = (entity as any)._oldOrderStatus;
    const newStatus = order.status;

    // ارسال اعلان در صورت تغییر وضعیت
    if (oldStatus !== newStatus) {
      await this.notifyStatusChange(order, oldStatus, newStatus);
    }

    // اگر سفارش لغو شد، موجودی رزرو شده را برگردان
    if (
      oldStatus !== OrderStatus.CANCELED &&
      newStatus === OrderStatus.CANCELED
    ) {
      await this.releaseReservedStock(order);
    }
  }

  /**
   * ارسال اعلان تغییر وضعیت سفارش
   */
  private async notifyStatusChange(
    order: any,
    oldStatus: OrderStatus,
    newStatus: OrderStatus
  ): Promise<void> {
    try {
      await this.salesNotificationHelper.notifyOrderStatusChanged(
        order.id,
        order.workspaceId,
        oldStatus,
        newStatus
      );
    } catch (error) {
      console.error(
        `[OrderService] Failed to send status change notification for order ${order.id}:`,
        error
      );
    }
  }

  /**
   * برگرداندن موجودی رزرو شده وقتی سفارش لغو می‌شود
   */
  private async releaseReservedStock(order: any): Promise<void> {
    if (!order.items || order.items.length === 0) {
      return;
    }

    const defaultWarehouse = await prisma.warehouse.findFirst({
      where: { workspaceId: order.workspaceId },
    });

    if (!defaultWarehouse) {
      console.warn(
        `[OrderService] No warehouse found for workspace ${order.workspaceId}`
      );
      return;
    }

    for (const item of order.items) {
      if (item.productId) {
        // پیدا کردن حرکت‌های رزرو برای این سفارش
        const movements = await prisma.stockMovement.findMany({
          where: {
            orderId: order.id,
            productId: item.productId,
            warehouseId: defaultWarehouse.id,
            movementType: StockMovementType.RESERVATION,
          },
        });

        // معکوس کردن هر حرکت رزرو
        for (const movement of movements) {
          await this.inventoryService.adjustStock(
            {
              workspaceId: order.workspaceId,
              warehouseId: defaultWarehouse.id,
              productId: item.productId,
              quantity: -movement.quantity, // معکوس
              movementType: StockMovementType.RESERVATION,
              description: `لغو سفارش - شماره ${order.id}`,
            },
            undefined
          );
        }
      }
    }
  }

  /**
   * تبدیل سفارش به فاکتور فروش
   */
  async createInvoiceFromOrder(
    orderId: number,
    context: AuthContext
  ): Promise<any> {
    const order = await this.getById(orderId, {
      include: {
        items: {
          include: {
            product: true,
          },
        },
        workspaceUser: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // محاسبه مجموع
    const subtotal = order.items.reduce(
      (sum: number, item: any) => sum + item.total,
      0
    );
    const total =
      subtotal +
      (order.tax || 0) -
      (order.discount || 0) +
      (order.shippingCost || 0);

    // ایجاد فاکتور
    const invoice = await prisma.invoice.create({
      data: {
        workspaceId: order.workspaceId,
        workspaceUserId: order.workspaceUserId,
        invoiceNumber: order.id, // می‌توانی از یک شماره‌گذاری خودکار استفاده کنی
        invoiceNumberName: `ORD-${order.id}`,
        type: "SALES",
        invoiceStatus: "APPROVED",
        subtotal,
        tax: order.tax || 0,
        discount: order.discount || 0,
        total,
        items: {
          create: order.items.map((item: any) => ({
            workspaceId: order.workspaceId,
            productId: item.productId,
            itemType: "PRODUCT",
            itemName: item.product?.name || "محصول",
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            tax: item.tax || 0,
            total: item.total,
          })),
        },
        orderId: order.id,
      },
      include: {
        items: true,
      },
    });

    // به‌روزرسانی وضعیت سفارش
    await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PAID },
    });

    return invoice;
  }
}
