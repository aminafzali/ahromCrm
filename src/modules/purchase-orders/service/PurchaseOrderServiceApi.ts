import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { InventoryServiceApi } from "@/modules/inventory/service/InventoryServiceApi";
import { StockMovementType } from "@prisma/client";
import { z } from "zod";

class Repository extends BaseRepository<any> {
  constructor() {
    super("purchaseOrder");
  }
}

const createPurchaseOrderSchema = z.object({
  supplierWorkspaceUserId: z.number().optional(),
  status: z.string().default("PENDING"),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.number(),
      quantity: z.number().positive(),
      unitPrice: z.number().nonnegative(),
    })
  ),
});

const updatePurchaseOrderSchema = z.object({
  supplierWorkspaceUserId: z.number().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

export class PurchaseOrderServiceApi extends BaseService<any> {
  protected inventoryService: InventoryServiceApi;

  constructor() {
    const repository = new Repository();
    super(
      repository,
      createPurchaseOrderSchema,
      updatePurchaseOrderSchema,
      [], // searchFields
      [] // relations
    );
    this.repository = repository;
    this.inventoryService = new InventoryServiceApi();

    // Initialize hooks
    this.afterUpdate = this.handleAfterUpdate;
  }

  /**
   * ایجاد سفارش خرید با آیتم‌ها
   */
  async create(data: any, context: AuthContext): Promise<any> {
    const { items, ...purchaseOrderData } = data;

    // محاسبه total برای هر آیتم
    const normalizedItems = items.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
    }));

    // ایجاد سفارش خرید با آیتم‌ها
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        workspaceId: context.workspaceId!,
        supplierWorkspaceUserId: purchaseOrderData.supplierWorkspaceUserId,
        status: purchaseOrderData.status || "PENDING",
        notes: purchaseOrderData.notes,
        items: {
          create: normalizedItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        supplierWorkspaceUser: {
          include: {
            user: true,
          },
        },
      },
    });

    return purchaseOrder;
  }

  /**
   * Hook بعد از آپدیت: بررسی تغییر وضعیت و به‌روزرسانی موجودی
   */
  private async handleAfterUpdate(entity: any): Promise<void> {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: entity.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!purchaseOrder) return;

    // اگر وضعیت به RECEIVED تغییر کرد، موجودی را به‌روزرسانی کن
    if (entity.status === "RECEIVED") {
      await this.receivePurchaseOrder(purchaseOrder);
    }
  }

  /**
   * تایید دریافت کالای سفارش خرید و به‌روزرسانی موجودی
   */
  async receivePurchaseOrder(purchaseOrder: any): Promise<void> {
    if (!purchaseOrder.items || purchaseOrder.items.length === 0) {
      return;
    }

    // پیدا کردن انبار پیش‌فرض
    const defaultWarehouse = await prisma.warehouse.findFirst({
      where: { workspaceId: purchaseOrder.workspaceId },
    });

    if (!defaultWarehouse) {
      console.warn(
        `[PurchaseOrderService] No warehouse found for workspace ${purchaseOrder.workspaceId}`
      );
      return;
    }

    const context = {
      workspaceId: purchaseOrder.workspaceId,
    } as AuthContext;

    // افزایش موجودی برای هر آیتم
    for (const item of purchaseOrder.items) {
      if (item.productId) {
        await this.inventoryService.adjustStock(
          {
            workspaceId: purchaseOrder.workspaceId,
            warehouseId: defaultWarehouse.id,
            productId: item.productId,
            quantity: item.quantity, // مثبت = ورود به انبار
            movementType: StockMovementType.PURCHASE,
            purchaseOrderId: purchaseOrder.id,
            description: `دریافت کالا از سفارش خرید ${purchaseOrder.id}`,
          },
          context
        );
      }
    }
  }

  /**
   * تبدیل سفارش خرید به فاکتور خرید
   */
  async convertToInvoice(
    purchaseOrderId: number,
    context: AuthContext
  ): Promise<any> {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        supplierWorkspaceUser: true,
      },
    });

    if (!purchaseOrder) {
      throw new Error("Purchase order not found");
    }

    if (purchaseOrder.linkedInvoiceId) {
      throw new Error("This purchase order is already linked to an invoice");
    }

    // محاسبه مجموع
    const totalAmount = purchaseOrder.items.reduce(
      (sum, item) => sum + item.total,
      0
    );

    // دریافت شماره فاکتور بعدی
    const lastInvoice = await prisma.invoice.findFirst({
      where: {
        workspaceId: purchaseOrder.workspaceId,
        type: "PURCHASE",
      },
      orderBy: { invoiceNumber: "desc" },
    });

    const invoiceNumber = lastInvoice ? lastInvoice.invoiceNumber + 1 : 1001;
    const invoiceNumberName = `P-${invoiceNumber}`;

    // ایجاد فاکتور خرید
    const invoice = await prisma.invoice.create({
      data: {
        workspaceId: purchaseOrder.workspaceId,
        workspaceUserId: purchaseOrder.supplierWorkspaceUserId!,
        type: "PURCHASE",
        invoiceStatus: "PENDING",
        invoiceNumber,
        invoiceNumberName,
        subtotal: totalAmount,
        total: totalAmount,
        tax: 0,
        discount: 0,
        items: {
          create: purchaseOrder.items.map((item) => ({
            workspaceId: purchaseOrder.workspaceId,
            productId: item.productId,
            itemName: item.product?.name || `محصول ${item.productId}`,
            description: item.product?.description || "",
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            tax: 0,
            discount: 0,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // لینک کردن فاکتور به سفارش خرید
    await prisma.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: {
        linkedInvoiceId: invoice.id,
      },
    });

    return invoice;
  }

  /**
   * لغو سفارش خرید
   */
  async cancel(purchaseOrderId: number): Promise<any> {
    const purchaseOrder = await prisma.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: {
        status: "CANCELED",
      },
    });

    return purchaseOrder;
  }

  /**
   * تایید سفارش خرید
   */
  async approve(purchaseOrderId: number): Promise<any> {
    const purchaseOrder = await prisma.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: {
        status: "APPROVED",
      },
    });

    return purchaseOrder;
  }
}
