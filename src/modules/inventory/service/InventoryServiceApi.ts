import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { StockMovementType } from "@prisma/client";
import { InventoryAlertService } from "./InventoryAlertService";

/**
 * ریپازیتوری ساده برای مدل StockMovement تا از BaseService استفاده کنیم.
 * در صورت نیاز می‌توانیم بعداً ریپازیتوری جدا برای Warehouse و ProductStock هم اضافه کنیم.
 */
class StockMovementRepository extends BaseRepository<any> {
  constructor() {
    super("StockMovement");
  }
}

export class InventoryServiceApi extends BaseService<any> {
  private alertService: InventoryAlertService;

  constructor() {
    // در این نسخه اولیه، فقط از StockMovement برای ثبت لاگ‌ها استفاده می‌کنیم.
    super(new StockMovementRepository(), null as any, null as any, [], []);
    this.repository = new StockMovementRepository();
    this.alertService = new InventoryAlertService();
  }

  /**
   * گرفتن موجودی یک محصول در یک انبار (یا مجموع همه انبارها اگر warehouseId داده نشود)
   */
  async getProductStock(params: {
    workspaceId: number;
    productId: number;
    warehouseId?: number;
  }) {
    const { workspaceId, productId, warehouseId } = params;

    if (warehouseId) {
      const stock = await prisma.productStock.findUnique({
        where: {
          workspaceId_warehouseId_productId: {
            workspaceId,
            warehouseId,
            productId,
          },
        },
      });
      return stock?.quantity ?? 0;
    }

    const result = await prisma.productStock.aggregate({
      where: {
        workspaceId,
        productId,
      },
      _sum: { quantity: true },
    });

    return result._sum.quantity ?? 0;
  }

  /**
   * متد عمومی برای ثبت حرکت انبار و به‌روزرسانی ProductStock
   * - quantity می‌تواند مثبت (ورود) یا منفی (خروج) باشد.
   */
  async adjustStock(
    data: {
      workspaceId: number;
      warehouseId: number;
      productId: number;
      quantity: number;
      movementType: StockMovementType;
      invoiceId?: number;
      orderId?: number;
      purchaseOrderId?: number;
      description?: string;
    },
    _context?: AuthContext
  ) {
    const {
      workspaceId,
      warehouseId,
      productId,
      quantity,
      movementType,
      invoiceId,
      orderId,
      purchaseOrderId,
      description,
    } = data;

    if (quantity === 0) {
      return null;
    }

    return prisma.$transaction(async (tx) => {
      // 1) ثبت لاگ حرکت
      const movement = await tx.stockMovement.create({
        data: {
          workspaceId,
          warehouseId,
          productId,
          quantity,
          movementType,
          invoiceId,
          orderId,
          purchaseOrderId,
          description,
        },
      });

      // 2) به‌روزرسانی ProductStock (upsert)
      const current = await tx.productStock.findUnique({
        where: {
          workspaceId_warehouseId_productId: {
            workspaceId,
            warehouseId,
            productId,
          },
        },
      });

      const newQty = (current?.quantity ?? 0) + quantity;

      await tx.productStock.upsert({
        where: {
          workspaceId_warehouseId_productId: {
            workspaceId,
            warehouseId,
            productId,
          },
        },
        update: {
          quantity: newQty,
        },
        create: {
          workspaceId,
          warehouseId,
          productId,
          quantity: newQty,
        },
      });

      // بررسی هشدار موجودی پایین بعد از تراکنش
      setTimeout(() => {
        this.alertService
          .checkAndAlertLowStock(workspaceId, productId)
          .catch((error) => {
            console.error("Failed to check low stock alert:", error);
          });
      }, 100);

      return movement;
    });
  }

  /**
   * دریافت تاریخچه حرکات موجودی یک محصول
   */
  async getStockHistory(params: {
    workspaceId: number;
    productId?: number;
    warehouseId?: number;
    limit?: number;
  }) {
    const { workspaceId, productId, warehouseId, limit = 50 } = params;

    const movements = await prisma.stockMovement.findMany({
      where: {
        workspaceId,
        ...(productId && { productId }),
        ...(warehouseId && { warehouseId }),
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
        warehouse: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return movements;
  }

  /**
   * دریافت آمار موجودی
   */
  async getInventorySummary(workspaceId: number) {
    const [stocks, lowStockAlerts, recentMovements] = await Promise.all([
      prisma.productStock.findMany({
        where: { workspaceId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      }),
      this.alertService.getLowStockAlerts(workspaceId),
      this.getStockHistory({ workspaceId, limit: 20 }),
    ]);

    const totalProducts = new Set(stocks.map((s) => s.productId)).size;
    const outOfStockProducts = stocks.filter((s) => s.quantity <= 0).length;
    const lowStockProducts = lowStockAlerts.length;

    const totalValue = stocks.reduce((sum, stock) => {
      return sum + stock.quantity * (stock.product.price || 0);
    }, 0);

    return {
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalValue,
      recentMovements,
      lowStockAlerts,
    };
  }

  /**
   * حواله بین دو انبار
   * برای هر آیتم:
   *  - یک حرکت منفی در انبار مبدا
   *  - یک حرکت مثبت در انبار مقصد
   */
  async transferStock(
    data: {
      workspaceId: number;
      fromWarehouseId: number;
      toWarehouseId: number;
      items: { productId: number; quantity: number }[];
      description?: string;
    },
    _context?: AuthContext
  ) {
    const { workspaceId, fromWarehouseId, toWarehouseId, items, description } =
      data;

    if (!items || items.length === 0) {
      return null;
    }

    return prisma.$transaction(async (tx) => {
      const transfer = await tx.stockTransfer.create({
        data: {
          workspaceId,
          fromWarehouseId,
          toWarehouseId,
          status: "DONE",
          items: {
            create: items.map((it) => ({
              productId: it.productId,
              quantity: it.quantity,
            })),
          },
        },
        include: { items: true },
      });

      for (const item of transfer.items) {
        const qty = item.quantity;

        // خروج از انبار مبدا
        await this.adjustStock(
          {
            workspaceId,
            warehouseId: fromWarehouseId,
            productId: item.productId,
            quantity: -qty,
            movementType: StockMovementType.TRANSFER_OUT,
            description,
          },
          _context
        );

        // ورود به انبار مقصد
        await this.adjustStock(
          {
            workspaceId,
            warehouseId: toWarehouseId,
            productId: item.productId,
            quantity: qty,
            movementType: StockMovementType.TRANSFER_IN,
            description,
          },
          _context
        );
      }

      return transfer;
    });
  }
}
