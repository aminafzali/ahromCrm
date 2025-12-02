import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import prisma from "@/lib/prisma";
import { NotificationServiceApi } from "@/modules/notifications/service/NotificationServiceApi";
import { LowStockAlert } from "../types";

/**
 * سرویس برای مدیریت هشدارهای موجودی
 */
export class InventoryAlertService {
  private notificationService: NotificationServiceApi;

  constructor() {
    this.notificationService = new NotificationServiceApi();
  }

  /**
   * دریافت محصولاتی که موجودی آنها پایین است
   */
  async getLowStockAlerts(workspaceId: number): Promise<LowStockAlert[]> {
    const stocks = await prisma.productStock.findMany({
      where: {
        workspaceId,
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
    });

    const alerts: LowStockAlert[] = [];

    for (const stock of stocks) {
      const minStock = 10; // حداقل موجودی پیش‌فرض (می‌توان در تنظیمات قرار داد)

      if (stock.quantity <= 0) {
        alerts.push({
          productId: stock.productId,
          productName: stock.product.name,
          warehouseId: stock.warehouseId,
          warehouseName: stock.warehouse.name,
          currentStock: stock.quantity,
          minimumStock: minStock,
          status: "critical",
        });
      } else if (stock.quantity <= minStock) {
        alerts.push({
          productId: stock.productId,
          productName: stock.product.name,
          warehouseId: stock.warehouseId,
          warehouseName: stock.warehouse.name,
          currentStock: stock.quantity,
          minimumStock: minStock,
          status: "warning",
        });
      }
    }

    return alerts.sort((a, b) => {
      // ابتدا critical، سپس warning
      if (a.status === b.status) {
        return a.currentStock - b.currentStock;
      }
      return a.status === "critical" ? -1 : 1;
    });
  }

  /**
   * ارسال هشدار موجودی پایین به ادمین‌ها
   */
  async sendLowStockAlerts(workspaceId: number): Promise<void> {
    const alerts = await this.getLowStockAlerts(workspaceId);

    if (alerts.length === 0) {
      return;
    }

    const criticalAlerts = alerts.filter((a) => a.status === "critical");
    const warningAlerts = alerts.filter((a) => a.status === "warning");

    let message = "🔔 هشدار موجودی:\n\n";

    if (criticalAlerts.length > 0) {
      message += `❌ ${criticalAlerts.length} محصول بدون موجودی:\n`;
      criticalAlerts.slice(0, 5).forEach((alert) => {
        message += `- ${alert.productName} (انبار: ${alert.warehouseName})\n`;
      });
      if (criticalAlerts.length > 5) {
        message += `... و ${criticalAlerts.length - 5} مورد دیگر\n`;
      }
      message += "\n";
    }

    if (warningAlerts.length > 0) {
      message += `⚠️ ${warningAlerts.length} محصول با موجودی پایین:\n`;
      warningAlerts.slice(0, 5).forEach((alert) => {
        message += `- ${alert.productName}: ${alert.currentStock} عدد (حداقل: ${alert.minimumStock})\n`;
      });
      if (warningAlerts.length > 5) {
        message += `... و ${warningAlerts.length - 5} مورد دیگر\n`;
      }
    }

    // ارسال به ادمین‌ها
    await this.notifyAdmins(workspaceId, "هشدار موجودی انبار", message);
  }

  /**
   * ارسال نوتیفیکیشن به تمام ادمین‌های workspace
   */
  private async notifyAdmins(
    workspaceId: number,
    title: string,
    message: string
  ): Promise<void> {
    const adminRole = await prisma.role.findFirst({
      where: {
        workspaceId,
        name: "Admin",
      },
    });

    if (!adminRole) return;

    const admins = await prisma.workspaceUser.findMany({
      where: {
        workspaceId,
        roleId: adminRole.id,
      },
      include: {
        user: true,
        role: true,
      },
    });

    for (const admin of admins) {
      const context: AuthContext = {
        workspaceId,
        user: admin.user,
        role: admin.role,
        workspaceUser: admin,
      };

      try {
        await this.notificationService.create(
          {
            workspaceUser: admin,
            title,
            message,
            sendSms: false,
          },
          context
        );
      } catch (error) {
        console.error(
          `Failed to send notification to admin ${admin.id}:`,
          error
        );
      }
    }
  }

  /**
   * بررسی خودکار موجودی و ارسال هشدار در صورت نیاز
   */
  async checkAndAlertLowStock(
    workspaceId: number,
    productId: number
  ): Promise<void> {
    const stock = await prisma.productStock.findFirst({
      where: {
        workspaceId,
        productId,
      },
      include: {
        product: {
          select: {
            name: true,
          },
        },
        warehouse: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!stock) return;

    const minStock = 10; // حداقل موجودی پیش‌فرض (می‌توان در تنظیمات قرار داد)

    if (stock.quantity <= 0) {
      const message = `❌ موجودی محصول "${stock.product.name}" در انبار "${stock.warehouse.name}" به پایان رسیده است.`;
      await this.notifyAdmins(workspaceId, "هشدار اتمام موجودی", message);
    } else if (stock.quantity <= minStock && stock.quantity > 0) {
      const message = `⚠️ موجودی محصول "${stock.product.name}" در انبار "${stock.warehouse.name}" به ${stock.quantity} عدد رسیده است (حداقل: ${minStock}).`;
      await this.notifyAdmins(workspaceId, "هشدار موجودی پایین", message);
    }
  }
}
