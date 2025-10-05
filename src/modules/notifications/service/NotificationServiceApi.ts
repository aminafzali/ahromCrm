// مسیر فایل: src/modules/notifications/service/NotificationServiceApi.ts

import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { FullQueryParams, PaginationResult } from "@/@Server/types";
import prisma from "@/lib/prisma";
import { SmsHelper } from "@/lib/smsHelper";
import { connects, include, relations, searchFileds } from "../data/fetch";
import {
  createNotificationSchema,
  updateNotificationSchema,
} from "../validation/schema";

// ریپازیتوری سرور به صورت داخلی تعریف می‌شود
class Repository extends BaseRepository<any> {
  constructor() {
    super("Notification");
  }
}

export class NotificationServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      createNotificationSchema,
      updateNotificationSchema,
      searchFileds,
      relations
    );
    this.connect = connects;
    this.repository = new Repository();

    // هوک afterCreate را به متد اصلاح‌شده متصل می‌کنیم
    this.afterCreate = this.handleAfterCreate;
  }

  // ایجاد گروهی گیرندگان بر اساس filters یا recipients
  protected beforeCreate = async (data: any): Promise<any> => {
    console.log("🔍 [NotificationServiceApi] beforeCreate called with data:", {
      recipients: data.recipients?.length || 0,
      filters: data.filters,
      workspaceUser: data.workspaceUser?.id,
      workspaceId: data.workspaceId,
    });

    const { recipients, filters, workspaceUser } = data;

    // بررسی workspaceId
    if (!data.workspaceId) {
      console.error("🔍 [NotificationServiceApi] workspaceId is missing!");
      throw new Error("workspaceId is required");
    }

    // استفاده از شماره اعلان که از فرم آمده یا تولید جدید
    let notificationNumber = data.notificationNumber;
    let notificationNumberName = data.notificationNumberName;

    // اگر اعلان از یادآور یا کران جاب می‌آید، فقط در صورت عدم وجود شماره، شماره جدید تولید کن
    if ((!notificationNumber || !notificationNumberName) && data.reminderId) {
      const generated = await this.generateNotificationNumber(data.workspaceId);
      notificationNumber = generated.notificationNumber;
      notificationNumberName = generated.notificationNumberName;
      console.log(
        "🔍 [NotificationServiceApi] Generated new notification number for reminder/cron:",
        {
          notificationNumber,
          notificationNumberName,
          reminderId: data.reminderId,
        }
      );
    } else if (
      data.reminderId &&
      notificationNumber &&
      notificationNumberName
    ) {
      console.log(
        "🔍 [NotificationServiceApi] Using existing notification number for grouped reminder:",
        {
          notificationNumber,
          notificationNumberName,
          reminderId: data.reminderId,
        }
      );
    }

    const groupName = this.generateGroupName(data, notificationNumber);

    // استخراج workspaceUserId از workspaceUser
    if (workspaceUser?.id) {
      data.workspaceUserId = workspaceUser.id;
      delete data.workspaceUser;
    }

    // اضافه کردن فیلدهای گروه‌بندی
    data.notificationNumber = notificationNumber?.toString();
    data.notificationNumberName = notificationNumberName;
    data.groupName = groupName;
    data.status = "SENT"; // وضعیت پیش‌فرض موفق

    // اگر workspaceUser تکی داده شده بود، اجازه بدهید مسیر فعلی کار کند
    if ((!recipients || recipients.length === 0) && !filters) {
      console.log(
        "🔍 [NotificationServiceApi] Single user or no recipients, returning data with number and group"
      );
      return data;
    }

    // از داده اصلی فقط اطلاعات نوتیفیکیشن را حفظ می‌کنیم
    const baseData: any = {
      title: data.title,
      message: data.message,
      note: data.note,
      sendSms: data.sendSms,
      sendEmail: data.sendEmail,
      requestId: data.requestId,
      invoiceId: data.invoiceId,
      reminderId: data.reminderId,
      paymentId: data.paymentId,
      // CRITICAL: workspaceId must be present for Prisma create
      workspaceId: data.workspaceId,
      notificationNumber: data.notificationNumber?.toString(), // اضافه کردن شماره اعلان
      notificationNumberName: data.notificationNumberName, // اضافه کردن نام شماره اعلان
      groupName: data.groupName, // اضافه کردن نام گروه
      status: "SENT", // وضعیت پیش‌فرض موفق
    };

    // مسیر recipients دستی
    if (Array.isArray(recipients) && recipients.length > 0) {
      // ایجاد اعلان برای همه به جز اولین
      for (let i = 1; i < recipients.length; i++) {
        const createdNotification = await this.repository.create({
          ...baseData,
          workspaceUserId: recipients[i].workspaceUserId,
        });
        // اجرای afterCreate برای هر اعلان
        await this.handleAfterCreate(createdNotification);
      }
      // برگرداندن اولی تا BaseService خودش ایجاد کنه
      // afterCreate hook خودکار اجرا می‌شود
      return {
        ...baseData,
        workspaceUserId: recipients[0].workspaceUserId,
      };
    }

    // مسیر filters: واکشی کاربران هدف و ساخت گروهی
    if (filters) {
      const { groupIds = [], labelIds = [], q = "", selectFiltered } = filters;
      if (selectFiltered) {
        // واکشی کاربران هدف با شرایط
        const targets = await prisma.workspaceUser.findMany({
          where: {
            ...(groupIds.length > 0 && {
              userGroups: { some: { id: { in: groupIds } } },
            }),
            ...(labelIds.length > 0 && {
              labels: { some: { id: { in: labelIds } } },
            }),
            ...(q && {
              OR: [
                { displayName: { contains: q } },
                { user: { name: { contains: q } } },
                { user: { phone: { contains: q } } },
              ],
            }),
          },
          select: { id: true },
        });

        // ایجاد برای همه به جز اولی
        for (let i = 1; i < targets.length; i++) {
          const createdNotification = await this.repository.create({
            ...baseData,
            workspaceUserId: targets[i].id,
          });
          // اجرای afterCreate برای هر اعلان
          await this.handleAfterCreate(createdNotification);
        }

        // برگرداندن اولی
        // afterCreate hook خودکار اجرا می‌شود
        return {
          ...baseData,
          workspaceUserId: workspaceUser?.id || (targets?.[0]?.id ?? undefined),
        };
      }
    }

    return data;
  };

  /**
   * ساخت متن پیامک با جزئیات موضوع
   */
  private buildSmsMessage(fullEntity: any): string {
    let subjectText = "";

    // اگر به درخواست متصل است
    if (fullEntity.request) {
      const serviceType = fullEntity.request.serviceType?.name || "نامشخص";
      const status = fullEntity.request.status?.name || "نامشخص";
      subjectText = `درخواست: ${serviceType} - وضعیت: ${status}\n`;
    }
    // اگر به فاکتور متصل است
    else if (fullEntity.invoice) {
      subjectText = `فاکتور: شماره ${fullEntity.invoice.id}\n`;
    }
    // اگر به پرداخت متصل است
    else if (fullEntity.payment) {
      subjectText = `پرداخت: شماره ${fullEntity.payment.id}\n`;
    }
    // اگر به یادآور متصل است
    else if (fullEntity.reminder) {
      const reminderTitle =
        fullEntity.reminder.title || `شماره ${fullEntity.reminder.id}`;
      subjectText = `یادآور: ${reminderTitle}\n`;
    }

    return `${subjectText}${fullEntity.title}\n${fullEntity.message}\n\nلغو11`;
  }

  /**
   * هوک afterCreate برای ارسال نوتیفیکیشن SMS.
   * این نسخه جدید، بهینه شده و با معماری WorkspaceUser کاملاً سازگار است.
   */
  private async handleAfterCreate(entity: any): Promise<void> {
    // ===== شروع لاگ ردیابی ۱: بررسی entity اولیه =====
    console.log(
      `%c[NotificationService] 1. 'afterCreate' hook triggered for Notification ID: ${entity.id}`,
      "color: #6f42c1; font-weight: bold;"
    );
    console.log(
      `[NotificationService]    Initial entity received from BaseService:`,
      entity
    );
    // =================================================

    try {
      // ===== شروع اصلاحیه کلیدی =====
      // ۱. به جای تکیه بر entity ورودی، ما آن را با تمام روابط مورد نیاز از دیتابیس دوباره واکشی می‌کنیم.
      const fullEntity = await this.repository.findById(entity.id, { include });
      console.log(
        `%c[NotificationService] 2.1. Pre-send checks:`,
        "color: #6f42c1;",
        {
          workspaceId: (fullEntity as any).workspaceId,
          sendSms: (fullEntity as any).sendSms,
          phone: (fullEntity as any)?.workspaceUser?.user?.phone,
        }
      );

      // ===== لاگ ردیابی ۲: بررسی entity کامل =====
      console.log(
        `%c[NotificationService] 2. Fetched full entity with relations:`,
        "color: #6f42c1;",
        fullEntity
      );
      // ===========================================

      const customerProfile = fullEntity.workspaceUser;
      const customer = customerProfile?.user;

      // ۲. بررسی می‌کنیم که آیا کاربر، شماره تلفن و اجازه ارسال SMS وجود دارد یا خیر.
      if (customer && customer.phone && fullEntity.sendSms) {
        // قبل از ارسال، اعتبار پیامکی را لاگ می‌گیریم
        try {
          const credit = await (SmsHelper as any).getCredit?.();
          if (credit?.ok) {
            console.log("[SMS] Credit before send:", credit.credit);
          }
        } catch {}
        // ===== لاگ ردیابی ۳: اقدام به ارسال SMS =====
        console.log(
          `%c[NotificationService] 3. ✅ Conditions met. Attempting to send SMS to: ${customer.phone}`,
          "color: #28a745; font-weight: bold;"
        );
        // ==========================================

        // ساخت متن پیامک با جزئیات
        const smsText = this.buildSmsMessage(fullEntity);
        console.log("[SMS] SMS Text:", smsText);

        const sendResult = await SmsHelper.sendSmsText(customer.phone, smsText);
        console.log("[SMS] Send result:", sendResult);

        // به‌روزرسانی وضعیت اعلان بر اساس نتیجه ارسال
        if (sendResult && (sendResult as any).ok) {
          // اگر SMS موفق بود، وضعیت را SENT نگه دار (یا اگر قبلاً SENT نبود، آن را SENT کن)
          if (fullEntity.status !== "SENT") {
            await this.repository.update(entity.id, { status: "SENT" });
            console.log(
              `%c[NotificationService] 4. ✅ SMS sent successfully. Status updated to SENT.`,
              "color: #28a745;"
            );
          } else {
            console.log(
              `%c[NotificationService] 4. ✅ SMS sent successfully. Status already SENT.`,
              "color: #28a745;"
            );
          }
        } else {
          // فقط در صورت خطا در ارسال SMS، وضعیت را FAILED کن
          await this.repository.update(entity.id, { status: "FAILED" });
          console.log(
            `%c[NotificationService] 4. ❌ SMS failed. Status updated to FAILED.`,
            "color: #dc3545;"
          );
        }
      } else {
        // ===== لاگ ردیابی ۳ (حالت جایگزین): عدم ارسال SMS =====
        console.warn(
          `%c[NotificationService] 3. ⚠️ SMS not sent. Conditions not met:`,
          "color: #fd7e14;",
          {
            hasCustomer: !!customer,
            hasPhone: !!customer?.phone,
            shouldSendSms: !!fullEntity.sendSms,
          }
        );
        // ====================================================
      }
      // ===== پایان اصلاحیه کلیدی =====
    } catch (error) {
      console.error(
        `%c[NotificationService] ❌ Error in handleAfterCreate:`,
        "color: #dc3545; font-weight: bold;",
        error
      );
    }
  }

  /**
   * Override getAll to handle groupIds and labelIds filters
   */
  async getAll(
    params: FullQueryParams = { page: 1, limit: 10 },
    context?: AuthContext
  ): Promise<PaginationResult<any>> {
    // Process groupIds and labelIds filters
    const processedFilters = this.processGroupLabelFilters(
      params.filters || {}
    );
    params.filters = { ...processedFilters, ...this.defaultFilter };

    // Call parent getAll method
    return super.getAll(params, context);
  }

  /**
   * Process groupIds, labelIds, and groupName filters for notifications
   */
  private processGroupLabelFilters(filters: any): any {
    if (!filters) return {};

    const { groupIds, labelIds, groupName, ...otherFilters } = filters;
    const processedFilters = { ...otherFilters };

    // Handle groupName filter (individual/grouped)
    if (groupName) {
      if (groupName === "individual") {
        processedFilters.groupName = null; // اعلان‌های فردی
      } else if (groupName === "grouped") {
        processedFilters.groupName = { not: null }; // اعلان‌های گروهی
      }
      // اگر "all" باشد، فیلتر اضافه نمی‌کنیم
    }

    // Handle groupIds filter
    if (groupIds) {
      const ids = String(groupIds)
        .split(",")
        .map(Number)
        .filter((id) => !isNaN(id));

      if (ids.length > 0) {
        processedFilters.workspaceUser = {
          ...processedFilters.workspaceUser,
          userGroups: {
            some: {
              id: { in: ids },
            },
          },
        };
      }
    }

    // Handle labelIds filter
    if (labelIds) {
      const ids = String(labelIds)
        .split(",")
        .map(Number)
        .filter((id) => !isNaN(id));

      if (ids.length > 0) {
        processedFilters.workspaceUser = {
          ...processedFilters.workspaceUser,
          labels: {
            some: {
              id: { in: ids },
            },
          },
        };
      }
    }

    return processedFilters;
  }

  /**
   * تولید شماره اعلان خودکار (مثل فاکتورها)
   * این متد فقط در صورتی استفاده می‌شود که شماره از فرم نیامده باشد
   */
  private async generateNotificationNumber(
    workspaceId: number
  ): Promise<{ notificationNumber: number; notificationNumberName: string }> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // پیدا کردن آخرین شماره برای این ماه و workspace
    const lastNumber = await prisma.notificationNumber.findFirst({
      where: { year, month, workspaceId },
      orderBy: { number: "desc" },
    });

    const nextNumber = lastNumber ? lastNumber.number + 1 : 1;

    // ذخیره شماره جدید
    await prisma.notificationNumber.create({
      data: { year, month, number: nextNumber, workspaceId },
    });

    const notificationNumberName = `NO-${year}${month
      .toString()
      .padStart(2, "0")}${nextNumber.toString().padStart(4, "0")}`;

    return {
      notificationNumber: nextNumber,
      notificationNumberName,
    };
  }

  /**
   * تولید نام گروه بر اساس عنوان، موضوع و شماره اعلان
   */
  private generateGroupName(
    data: any,
    notificationNumber: number | string
  ): string {
    let groupName = data.title;

    // تشخیص نوع موجودیت بر اساس فیلدهای موجود
    let entityType = "GENERAL";
    if (data.requestId) {
      entityType = "REQUEST";
    } else if (data.invoiceId) {
      entityType = "INVOICE";
    } else if (data.paymentId) {
      entityType = "PAYMENT";
    } else if (data.reminderId) {
      entityType = "REMINDER";
    } else if (data.entityType) {
      entityType = data.entityType;
    }

    // اضافه کردن اطلاعات موضوع
    if (entityType && entityType !== "GENERAL") {
      groupName += ` - ${entityType}`;
    }

    // اضافه کردن شماره اعلان
    groupName += ` - ${notificationNumber}`;

    return groupName;
  }

  // Override afterCreate hook برای اجرای handleAfterCreate
  protected afterCreate = async (entity: any): Promise<void> => {
    await this.handleAfterCreate(entity);
  };

  public async getGroupedNotifications(params: any) {
    try {
      const { page = 1, limit = 10, filters = {} } = params;

      // اگر notificationNumber مشخص شده، فقط اعلان‌های آن گروه را برگردان
      if (filters.notificationNumber) {
        const result = await this.repository.findAll({
          page: 1,
          limit: 1000, // برای جزئیات گروه، همه اعلان‌های آن گروه را بگیر
          filters: {
            ...filters,
            notificationNumber: filters.notificationNumber,
          },
          include: include,
          search: filters.search || "",
          searchFields: searchFileds,
        });

        // اگر اعلانی پیدا شد، آن را به فرمت گروه تبدیل کن
        if (result.data.length > 0) {
          const firstNotification = result.data[0];
          const group = {
            notificationNumber: firstNotification.notificationNumber,
            groupName: firstNotification.groupName,
            title: firstNotification.title,
            entityType: firstNotification.entityType,
            createdAt: firstNotification.createdAt,
            status: firstNotification.status,
            userCount: result.data.length,
            notifications: result.data,
          };

          return {
            data: [group],
            pagination: { total: 1, pages: 1, page: 1, limit: 1 },
          };
        } else {
          return {
            data: [],
            pagination: { total: 0, pages: 0, page: 1, limit: 10 },
          };
        }
      }

      // دریافت همه اعلان‌های گروهی (آنهایی که notificationNumber دارند یا groupName دارند)
      const result = await this.repository.findAll({
        page,
        limit,
        filters: {
          ...filters,
          OR: [
            { notificationNumber: { not: null } }, // اعلان‌هایی که شماره دارند
            { groupName: { not: null } }, // اعلان‌هایی که نام گروه دارند
          ],
        },
        include: include,
        search: filters.search || "",
        searchFields: searchFileds,
      });

      // گروه‌بندی بر اساس notificationNumber یا groupName
      const groupedMap = new Map();

      result.data.forEach((notification: any) => {
        // استفاده از notificationNumber اگر موجود باشد، در غیر این صورت از groupName
        const key = notification.notificationNumber || notification.groupName;
        if (!key) return;

        if (!groupedMap.has(key)) {
          groupedMap.set(key, {
            notificationNumber: notification.notificationNumber,
            groupName: notification.groupName,
            title: notification.title,
            entityType: notification.entityType,
            createdAt: notification.createdAt,
            status: notification.status,
            userCount: 0,
            notifications: [],
          });
        }

        const group = groupedMap.get(key);
        group.userCount++;
        group.notifications.push(notification);
      });

      // تبدیل به آرایه و مرتب‌سازی
      const groupedData = Array.from(groupedMap.values()).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return {
        data: groupedData,
        pagination: result.pagination,
      };
    } catch (error) {
      console.error("Error fetching grouped notifications:", error);
      throw error;
    }
  }
}
