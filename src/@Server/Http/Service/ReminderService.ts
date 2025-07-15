// مسیر فایل: src/app/@Server/services/reminders/ReminderService.ts (نسخه نهایی و کامل)

import { ValidationException } from "@/@Server/Exceptions/BaseException";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { NotificationServiceApi } from "@/modules/notifications/service/NotificationServiceApi";
import { DateTime } from "luxon";
import { createLogger } from "../../utils/logger";
import { createReminderSchema } from "./validation/schema";

const logger = createLogger("ReminderService");
const MAX_RETRIES = 3;

class Repository extends BaseRepository<any> {
  constructor() {
    super("Reminder");
  }
}

export class ReminderService extends BaseService<any> {
  private notificationService: NotificationServiceApi;

  constructor() {
    super(
      new Repository(),
      createReminderSchema,
      createReminderSchema.partial(),
      ["title", "description"]
    );
    this.notificationService = new NotificationServiceApi();
  }

  private async sendNotification(reminder: any) {
    const user = await prisma.user.findUnique({
      where: { id: reminder.userId },
    });
    if (!user) {
      logger.warn(`User not found for reminder ${reminder.id}`);
      return;
    }

    const message = `${reminder.title}\n${reminder.description || ""}${
      reminder.entityId ? `\nمربوط به آیتم شماره: ${reminder.entityId}` : ""
    }`;

    // ساخت یک آبجکت نوتیفیکیشن پایه
    const notificationData: any = {
      userId: reminder.userId,
      title: "یادآوری: " + reminder.title,
      message: message,
      note: reminder.description,
      sendSms:
        reminder.notificationChannels === "SMS" ||
        reminder.notificationChannels === "ALL",
      sendEmail:
        reminder.notificationChannels === "EMAIL" ||
        reminder.notificationChannels === "ALL",
    };

    // ++ اصلاحیه کلیدی: فیلد requestId را فقط در صورتی اضافه می‌کنیم که وجود داشته باشد ++
    if (reminder.entityType === "Request" && reminder.entityId) {
      notificationData.requestId = reminder.entityId;
    }

    logger.info(
      `[ReminderService] Attempting to create notification with payload: ${JSON.stringify(
        notificationData,
        null,
        2
      )}`
    );
    await this.notificationService.create(notificationData);
  }

  async checkDueReminders(batchSize = 50, offset = 0) {
    try {
      const now = DateTime.now().setZone("Asia/Tehran").toJSDate();
      logger.info(
        `[ReminderService] Checking for reminders due before: ${now.toISOString()}`
      );

      const dueReminders = await this.repository.findAll({
        filters: { dueDate: { lte: now }, notified: false, status: "PENDING" },
        limit: batchSize,
        page: 1 + Math.floor(offset / batchSize),
      });

      logger.info(
        `[ReminderService] Found ${dueReminders.data.length} due reminders.`
      );

      let processedCount = 0;
      for (const reminder of dueReminders.data) {
        try {
          await this.processReminder(reminder);
          processedCount++;
        } catch (error: any) {
          if (error instanceof ValidationException) {
            logger.error(
              `[Validation failed] for reminder ${
                reminder.id
              }: ${JSON.stringify(error.errors, null, 2)}`
            );
          } else {
            logger.error(
              `[Error processing] reminder ${reminder.id}:`,
              error.message || error
            );
          }
          await this.handleReminderError(reminder);
        }
      }

      logger.info(
        `[ReminderService] Completed batch. Processed ${processedCount} reminders.`
      );
      return {
        processed: processedCount,
        hasMore: dueReminders.data.length === batchSize,
      };
    } catch (error: any) {
      logger.error(
        "[ReminderService] Critical error in checkDueReminders:",
        error.message || error
      );
      throw error;
    }
  }

  private async processReminder(reminder: any) {
    try {
      await this.sendNotification(reminder);
      await this.repository.update(reminder.id, {
        notified: true,
        lastNotified: new Date(),
        status: "COMPLETED",
      });
      if (reminder.repeatInterval) {
        await this.createNextReminder(reminder);
      }
      logger.info(
        `[ReminderService] Successfully processed reminder ${reminder.id}`
      );
    } catch (error) {
      throw error;
    }
  }

  private async handleReminderError(reminder: any) {
    const retryCount = (reminder.retryCount || 0) + 1;
    const updateData: any = { retryCount, lastRetry: new Date() };
    if (retryCount >= MAX_RETRIES) {
      updateData.status = "FAILED";
    }
    await this.repository.update(reminder.id, updateData);
  }

  private async createNextReminder(reminder: any) {
    const nextDate = this.calculateNextReminderDate(
      reminder.dueDate,
      reminder.repeatInterval
    );
    if (nextDate) {
      const newReminder = {
        ...reminder,
        dueDate: nextDate,
        notified: false,
        lastNotified: null,
        retryCount: 0,
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      delete newReminder.id;
      await this.create(newReminder);
    }
  }

  private calculateNextReminderDate(
    currentDate: Date,
    interval: string
  ): Date | null {
    const date = new Date(currentDate);
    switch (interval.toLowerCase()) {
      case "daily":
        date.setDate(date.getDate() + 1);
        break;
      case "weekly":
        date.setDate(date.getDate() + 7);
        break;
      case "monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      default:
        return null;
    }
    return date;
  }
}

// reminder قبلی
// import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
// import { BaseService } from "@/@Server/Http/Service/BaseService";
// import prisma from "@/lib/prisma";
// import { NotificationServiceApi } from "@/modules/notifications/service/NotificationServiceApi";
// import { DateTime } from "luxon";
// import { createLogger } from "../../utils/logger";
// import { createReminderSchema } from "./validation/schema";

// const logger = createLogger("ReminderService");
// const MAX_RETRIES = 3;

// class Repository extends BaseRepository<any> {
//   constructor() {
//     super("Reminder");
//   }
// }

// export class ReminderService extends BaseService<any> {
//   private notificationService: NotificationServiceApi;

//   constructor() {
//     super(
//       new Repository(),
//       createReminderSchema,
//       createReminderSchema,
//       ["title", "description"]
//       //  ["user"]
//     );
//     this.notificationService = new NotificationServiceApi();
//   }

//   async checkDueReminders(batchSize = 50, offset = 0) {
//     try {
//       // const now = new Date("Asia/Tehran")
//       const now = DateTime.now().setZone("system");
//       const now2 = DateTime.now().setZone("Asia/Tehran");
//       console.log("now date : ", now);
//       console.log("now2 date : ", now2);

//       const dueReminders = await this.repository.findAll({
//         filters: {
//           dueDate: { lte: now },
//           notified: false,
//           status: "PENDING",
//         },
//         limit: batchSize,
//         page: 1,
//       });

//       console.log("dueReminders", dueReminders);

//       let processed = 0;

//       for (const reminder of dueReminders.data) {
//         try {
//           await this.processReminder(reminder);
//           processed++;
//         } catch (error) {
//           logger.error(`Error processing reminder ${reminder.id}:`, error);
//           await this.handleReminderError(reminder);
//         }
//       }

//       return {
//         processed,
//         hasMore: dueReminders.data.length === batchSize,
//       };
//     } catch (error) {
//       logger.error("Error checking reminders:", error);
//       throw error;
//     }
//   }

//   private async processReminder(reminder: any) {
//     try {
//       // Send notifications
//       await this.sendNotification(reminder);

//       // Update reminder status
//       await this.repository.update(reminder.id, {
//         notified: true,
//         lastNotified: new Date(),
//         status: "COMPLETED",
//       });

//       // Handle recurring reminders
//       if (reminder.repeatInterval) {
//         await this.createNextReminder(reminder);
//       }

//       logger.info(`Successfully processed reminder ${reminder.id}`);
//     } catch (error) {
//       throw error;
//     }
//   }

//   private async handleReminderError(reminder: any) {
//     const retryCount = (reminder.retryCount || 0) + 1;
//     const updateData: any = {
//       retryCount,
//       lastRetry: new Date(),
//     };

//     if (retryCount >= MAX_RETRIES) {
//       updateData.status = "FAILED";
//     }

//     await this.repository.update(reminder.id, updateData);
//   }

//   private async sendNotification(reminder: any) {
//     const user = await prisma.user.findUnique({
//       where: { id: reminder.userId },
//     });

//     if (!user) {
//       logger.warn(`User not found for reminder ${reminder.id}`);
//       return;
//     }
//     const message =
//       reminder.title +
//       "\n" +
//       reminder.description +
//       "\n" +
//       "شماره پیگیری :‌ " +
//       reminder.entityId;

//     // Create in-app notification
//     await this.notificationService.create({
//       userId: reminder.userId,
//       title: "یادآوری",
//       message: message,
//       requestId: reminder.entityType === "Request" ? reminder.entityId : null,
//     });

//     // Send SMS if enabled
//     if (
//       reminder.notificationChannels === "SMS" ||
//       reminder.notificationChannels === "ALL"
//     ) {
//       if (user.phone) {
//         // await SmsHelper.sendNotification(
//         //   user.phone,
//         //   "یادآوری",
//         //   reminder.description || reminder.title
//         // );
//       }
//     }

//     // Send email if enabled
//     if (
//       reminder.notificationChannels === "EMAIL" ||
//       reminder.notificationChannels === "ALL"
//     ) {
//       if (user.email) {
//         // Email implementation would go here
//         // await EmailService.send(...)
//       }
//     }
//   }

//   private async createNextReminder(reminder: any) {
//     const nextDate = this.calculateNextReminderDate(
//       reminder.dueDate,
//       reminder.repeatInterval
//     );

//     if (nextDate) {
//       const newReminder = {
//         ...reminder,
//         dueDate: nextDate,
//         notified: false,
//         lastNotified: null,
//         retryCount: 0,
//         status: "PENDING",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };

//       delete newReminder.id;
//       await this.create(newReminder);
//     }
//   }

//   // async newReminder(reminder: any) {
//   //   const newReminder = {
//   //     ...reminder,
//   //     notified: false,
//   //     status: "PENDING",
//   //   };

//   //   return this.create(newReminder);
//   // }

//   private calculateNextReminderDate(
//     currentDate: Date,
//     interval: string
//   ): Date | null {
//     const date = new Date(currentDate);

//     switch (interval.toLowerCase()) {
//       case "daily":
//         date.setDate(date.getDate() + 1);
//         break;
//       case "weekly":
//         date.setDate(date.getDate() + 7);
//         break;
//       case "monthly":
//         date.setMonth(date.getMonth() + 1);
//         break;
//       default:
//         return null;
//     }

//     return date;
//   }

//   // API Endpoints for reminder management
//   async searchReminders(params: any) {
//     const filters: any = {};

//     if (params.status) {
//       filters.status = params.status;
//     }

//     if (params.startDate) {
//       filters.dueDate = { gte: new Date(params.startDate) };
//     }

//     if (params.endDate) {
//       filters.dueDate = { ...filters.dueDate, lte: new Date(params.endDate) };
//     }

//     return this.repository.findAll({
//       filters,
//       orderBy: params.orderBy || { dueDate: "asc" },
//       page: params.page,
//       limit: params.limit,
//     });
//   }

//   async bulkCreate(reminders: any[]) {
//     return this.repository.createMany(reminders);
//   }

//   async bulkUpdate(ids: number[], data: any) {
//     return this.repository.updateMany({ id: { in: ids } }, data);
//   }

//   async bulkDelete(ids: number[]) {
//     return this.repository.deleteMany({ id: { in: ids } });
//   }
// }
