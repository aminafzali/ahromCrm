// مسیر فایل: src/modules/notifications/service/NotificationServiceApi.ts

import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
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
    const { recipients, filters, workspaceUser } = data;

    // استخراج workspaceUserId از workspaceUser
    if (workspaceUser?.id) {
      data.workspaceUserId = workspaceUser.id;
      delete data.workspaceUser;
    }

    // اگر workspaceUser تکی داده شده بود، اجازه بدهید مسیر فعلی کار کند
    if (!recipients && !filters) return data;

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
    };

    // مسیر recipients دستی
    if (Array.isArray(recipients) && recipients.length > 0) {
      // ایجاد اعلان برای همه به جز اولین
      for (let i = 1; i < recipients.length; i++) {
        await this.repository.create({
          ...baseData,
          workspaceUserId: recipients[i].workspaceUserId,
        });
      }
      // برگرداندن اولی تا BaseService خودش ایجاد کنه
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
          await this.repository.create({
            ...baseData,
            workspaceUserId: targets[i].id,
          });
        }

        // برگرداندن اولی
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

        const sendResult = await SmsHelper.sendSmsText(customer.phone, smsText);
        console.log("[SMS] Send result:", sendResult);

        console.log(
          `%c[NotificationService] 4. ✅ SMS sent successfully.`,
          "color: #28a745;"
        );
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

  // نیازی به بازنویسی متد create نیست، چون BaseService به درستی آن را مدیریت می‌کند.
}

// import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
// import { BaseService } from "@/@Server/Http/Service/BaseService";
// import { SmsHelper } from "@/lib/smsHelper";
// import { UserServiceApi } from "@/modules/users/service/UserServiceApi";
// import { relations, searchFileds } from "../data/fetch";
// import { createNotificationSchema } from "../validation/schema";

// class Repository extends BaseRepository<any> {
//   constructor() {
//     super("Notification");
//   }
// }

// export class NotificationServiceApi extends BaseService<any> {
//   protected userRepo: UserServiceApi;

//   constructor() {
//     super(
//       new Repository(),
//       createNotificationSchema,
//       createNotificationSchema,
//       searchFileds,
//       relations
//     );
//     this.repository = new Repository();
//     this.userRepo = new UserServiceApi();

//     // Initialize hooks
//     this.afterCreate = this.handleAfterCreate;
//   }

//   /**
//    * Handle after create hook to send SMS
//    */
//   private async handleAfterCreate(entity: any): Promise<void> {
//     try {
//       console.log("entity n", entity);
//       // Get user phone number
//       const user = await this.userRepo.getById(entity.userId);

//       if (user && entity.sendSms) {
//         console.log("smsSend", entity.sendSms);
//         // Send SMS notification
//         await SmsHelper.sendNotification(
//           user.phone,
//           entity.title,
//           entity.message
//         );
//       }
//     } catch (error) {
//       console.error("Error sending notification SMS:", error);
//     }
//   }
// }
