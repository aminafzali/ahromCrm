import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import prisma from "@/lib/prisma";
import { NotificationServiceApi } from "@/modules/notifications/service/NotificationServiceApi";

/**
 * Helper برای مدیریت اعلانات فروش بر اساس تنظیمات SalesNotificationSettings
 */
export class SalesNotificationHelper {
  private notificationService: NotificationServiceApi;

  constructor() {
    this.notificationService = new NotificationServiceApi();
  }

  /**
   * دریافت تنظیمات اعلان فروش برای یک workspace
   */
  private async getSettings(workspaceId: number) {
    let settings = await prisma.salesNotificationSettings.findUnique({
      where: { workspaceId },
    });

    // اگر تنظیماتی وجود نداشت، یک رکورد پیش‌فرض بساز
    if (!settings) {
      settings = await prisma.salesNotificationSettings.create({
        data: {
          workspaceId,
          notifyOnOrderCreated: true,
          notifyOnOrderStatusChanged: true,
          notifyOnInvoiceCreated: true,
          notifyOnInvoicePaid: true,
          sendInAppForAdmins: true,
          sendSmsForCustomer: true,
        },
      });
    }

    return settings;
  }

  /**
   * ارسال اعلان برای ایجاد سفارش جدید
   */
  async notifyOrderCreated(
    orderId: number,
    workspaceId: number,
    workspaceUserId: number
  ): Promise<void> {
    const settings = await this.getSettings(workspaceId);
    if (!settings.notifyOnOrderCreated) {
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        workspaceUser: {
          include: { user: true, role: true },
        },
      },
    });

    if (!order || !order.workspaceUser) return;

    const context: AuthContext = {
      workspaceId,
      user: order.workspaceUser.user,
      role: order.workspaceUser.role,
      workspaceUser: order.workspaceUser,
    };

    // اعلان برای مشتری
    if (settings.sendSmsForCustomer) {
      await this.notificationService.create(
        {
          workspaceUser: order.workspaceUser,
          title: "سفارش جدید ثبت شد",
          message: `سفارش شما با موفقیت ثبت شد.\nشماره سفارش: ${orderId}\nمبلغ: ${order.total.toLocaleString(
            "fa-IR"
          )} تومان`,
          sendSms: true,
        },
        context
      );
    }

    // اعلان برای ادمین‌ها
    if (settings.sendInAppForAdmins) {
      await this.notifyAdmins(
        workspaceId,
        "سفارش جدید",
        `سفارش جدیدی ثبت شد.\nشماره سفارش: ${orderId}\nمشتری: ${order.workspaceUser.user.name}`
      );
    }
  }

  /**
   * ارسال اعلان برای تغییر وضعیت سفارش
   */
  async notifyOrderStatusChanged(
    orderId: number,
    workspaceId: number,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    const settings = await this.getSettings(workspaceId);
    if (!settings.notifyOnOrderStatusChanged) {
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        workspaceUser: {
          include: { user: true, role: true },
        },
      },
    });

    if (!order || !order.workspaceUser) return;

    const context: AuthContext = {
      workspaceId,
      user: order.workspaceUser.user,
      role: order.workspaceUser.role,
      workspaceUser: order.workspaceUser,
    };

    const statusLabels: Record<string, string> = {
      NEW: "جدید",
      PENDING_PAYMENT: "در انتظار پرداخت",
      PAID: "پرداخت شده",
      PREPARING: "در حال آماده‌سازی",
      SHIPPED: "ارسال شده",
      COMPLETED: "تکمیل شده",
      CANCELED: "لغو شده",
    };

    // اعلان برای مشتری
    if (settings.sendSmsForCustomer) {
      await this.notificationService.create(
        {
          workspaceUser: order.workspaceUser,
          title: "تغییر وضعیت سفارش",
          message: `وضعیت سفارش شما از "${
            statusLabels[oldStatus] || oldStatus
          }" به "${
            statusLabels[newStatus] || newStatus
          }" تغییر کرد.\nشماره سفارش: ${orderId}`,
          sendSms: true,
        },
        context
      );
    }

    // اعلان برای ادمین‌ها
    if (settings.sendInAppForAdmins) {
      await this.notifyAdmins(
        workspaceId,
        "تغییر وضعیت سفارش",
        `وضعیت سفارش ${orderId} تغییر کرد: ${
          statusLabels[oldStatus] || oldStatus
        } → ${statusLabels[newStatus] || newStatus}`
      );
    }
  }

  /**
   * ارسال اعلان برای ایجاد فاکتور جدید
   */
  async notifyInvoiceCreated(
    invoiceId: number,
    workspaceId: number
  ): Promise<void> {
    const settings = await this.getSettings(workspaceId);
    if (!settings.notifyOnInvoiceCreated) {
      return;
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        workspaceUser: {
          include: { user: true, role: true },
        },
      },
    });

    if (!invoice || !invoice.workspaceUser) return;

    const context: AuthContext = {
      workspaceId,
      user: invoice.workspaceUser.user,
      role: invoice.workspaceUser.role,
      workspaceUser: invoice.workspaceUser,
    };

    const typeLabels: Record<string, string> = {
      SALES: "فروش",
      PURCHASE: "خرید",
      RETURN_SALES: "برگشت فروش",
      RETURN_PURCHASE: "برگشت خرید",
    };

    // اعلان برای مشتری
    if (settings.sendSmsForCustomer) {
      await this.notificationService.create(
        {
          workspaceUser: invoice.workspaceUser,
          title: "فاکتور جدید",
          message: `فاکتور ${
            typeLabels[invoice.type] || invoice.type
          } شما صادر شد.\nشماره فاکتور: ${invoiceId}\nمبلغ: ${invoice.total.toLocaleString(
            "fa-IR"
          )} تومان`,
          sendSms: true,
        },
        context
      );
    }

    // اعلان برای ادمین‌ها
    if (settings.sendInAppForAdmins) {
      await this.notifyAdmins(
        workspaceId,
        "فاکتور جدید",
        `فاکتور ${
          typeLabels[invoice.type] || invoice.type
        } جدید صادر شد.\nشماره: ${invoiceId}\nمشتری: ${
          invoice.workspaceUser.user.name
        }`
      );
    }
  }

  /**
   * ارسال اعلان برای پرداخت فاکتور
   */
  async notifyInvoicePaid(
    invoiceId: number,
    workspaceId: number
  ): Promise<void> {
    const settings = await this.getSettings(workspaceId);
    if (!settings.notifyOnInvoicePaid) {
      return;
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        workspaceUser: {
          include: { user: true, role: true },
        },
      },
    });

    if (!invoice || !invoice.workspaceUser) return;

    const context: AuthContext = {
      workspaceId,
      user: invoice.workspaceUser.user,
      role: invoice.workspaceUser.role,
      workspaceUser: invoice.workspaceUser,
    };

    // اعلان برای مشتری
    if (settings.sendSmsForCustomer) {
      await this.notificationService.create(
        {
          workspaceUser: invoice.workspaceUser,
          title: "پرداخت تایید شد",
          message: `پرداخت فاکتور ${invoiceId} با موفقیت انجام شد.\nمبلغ: ${invoice.total.toLocaleString(
            "fa-IR"
          )} تومان`,
          sendSms: true,
        },
        context
      );
    }

    // اعلان برای ادمین‌ها
    if (settings.sendInAppForAdmins) {
      await this.notifyAdmins(
        workspaceId,
        "پرداخت دریافت شد",
        `فاکتور ${invoiceId} پرداخت شد.\nمشتری: ${
          invoice.workspaceUser.user.name
        }\nمبلغ: ${invoice.total.toLocaleString("fa-IR")} تومان`
      );
    }
  }

  /**
   * ارسال اعلان به همه ادمین‌های workspace
   */
  private async notifyAdmins(
    workspaceId: number,
    title: string,
    message: string
  ): Promise<void> {
    // پیدا کردن نقش Admin
    const adminRole = await prisma.role.findFirst({
      where: {
        workspaceId,
        name: "Admin",
      },
    });

    if (!adminRole) return;

    // پیدا کردن همه workspaceUserهایی که نقش Admin دارند
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

    // ارسال اعلان به همه ادمین‌ها
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
            sendSms: false, // فقط in-app
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
}
