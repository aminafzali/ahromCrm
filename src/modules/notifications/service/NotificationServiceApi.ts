// مسیر فایل: src/modules/notifications/service/NotificationServiceApi.ts

import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { SmsHelper } from "@/lib/smsHelper";
import { connects, include, relations, searchFileds } from "../data/fetch";
import {
  createNotificationSchema,
  updateNotificationSchema,
} from "../validation/schema";

// ریپازیتوری سرور به صورت داخلی تعریف می‌شود
class Repository extends BaseRepository<any> {
  constructor() {
    super("notification");
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
        // ===== لاگ ردیابی ۳: اقدام به ارسال SMS =====
        console.log(
          `%c[NotificationService] 3. ✅ Conditions met. Attempting to send SMS to: ${customer.phone}`,
          "color: #28a745; font-weight: bold;"
        );
        // ==========================================

        await SmsHelper.sendNotification(
          customer.phone,
          fullEntity.title,
          fullEntity.message
        );

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
