// مسیر فایل: src/modules/notifications/service/NotificationServiceApi.ts

import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { SmsHelper } from "@/lib/smsHelper";
import { connects, relations, searchFileds } from "../data/fetch";
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
    try {
      // ===== شروع اصلاحیه کلیدی =====
      // ۱. دیگر نیازی به واکشی مجدد کاربر نیست. اطلاعات از خود entity خوانده می‌شود.
      const customerProfile = entity.workspaceUser;
      const customer = customerProfile?.user;

      // ۲. بررسی می‌کنیم که آیا کاربر، شماره تلفن و اجازه ارسال SMS وجود دارد یا خیر.
      if (customer && customer.phone && entity.sendSms) {
        console.log(`Sending notification SMS to: ${customer.phone}`);

        await SmsHelper.sendNotification(
          customer.phone,
          entity.title,
          entity.message
        );
      }
      // ===== پایان اصلاحیه کلیدی =====
    } catch (error) {
      console.error("Error sending notification SMS:", error);
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
