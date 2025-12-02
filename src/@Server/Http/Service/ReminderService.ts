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
    super(new Repository(), createReminderSchema, createReminderSchema, [
      "title",
      "description",
    ]);
    this.notificationService = new NotificationServiceApi();
  }

  // پشتیبانی از ایجاد گروهی ریمایندر بر اساس recipients یا filters
  protected beforeCreate = async (data: any): Promise<any> => {
    const { recipients, filters, workspaceUser } = data;

    // استخراج workspaceUserId از workspaceUser
    if (workspaceUser?.id) {
      data.workspaceUserId = workspaceUser.id;
      delete data.workspaceUser;
    }

    // اگر neither recipients nor filters ارائه نشده، همان مسیر قبلی
    if (!recipients && !filters) return data;

    const baseData: any = {
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      status: data.status || "PENDING",
      type: data.type,
      entityId: data.entityId,
      entityType: data.entityType,
      requestId: data.requestId,
      invoiceId: data.invoiceId,
      paymentId: data.paymentId,
      taskId: data.taskId,
      notificationChannels: data.notificationChannels,
      timezone: data.timezone,
      repeatInterval: data.repeatInterval,
      workspaceId: data.workspaceId,
    };

    // مسیر recipients دستی: برای هر گیرنده یک ریمایندر بسازیم
    if (Array.isArray(recipients) && recipients.length > 0) {
      await Promise.all(
        recipients.map(async (r: any) => {
          await this.repository.create({
            ...baseData,
            workspaceUserId: r.workspaceUserId,
          });
        })
      );
      // برگرداندن یک مورد نمونه برای تداوم جریان BaseService
      return { ...baseData, workspaceUserId: recipients[0].workspaceUserId };
    }

    // مسیر filters: واکشی کاربران هدف و ساخت گروهی
    if (filters) {
      const { groupIds = [], labelIds = [], q = "", selectFiltered } = filters;
      if (selectFiltered) {
        const targets = await prisma.workspaceUser.findMany({
          where: {
            ...(groupIds.length > 0 && {
              userGroupId: { in: groupIds },
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

        await Promise.all(
          (targets || []).map(async (t: any) => {
            await this.repository.create({
              ...baseData,
              workspaceUserId: t.id,
            });
          })
        );

        return { ...baseData, workspaceUserId: targets?.[0]?.id };
      }
    }

    return data;
  };

  private async generateSharedNotificationNumber(
    workspaceId: number
  ): Promise<string> {
    try {
      // پیدا کردن آخرین شماره اعلان برای این workspace (بدون در نظر گیری سال/ماه)
      const lastNotification = await prisma.notification.findFirst({
        where: {
          workspaceId,
          notificationNumber: { not: null },
        },
        orderBy: { id: "desc" },
        select: { notificationNumber: true },
      });

      // استخراج شماره از آخرین اعلان
      let nextNumber = 1;
      if (lastNotification?.notificationNumber) {
        const lastNumber = parseInt(lastNotification.notificationNumber);
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }

      const simpleNotificationNumber = nextNumber.toString();

      logger.info(
        `[ReminderService] Generated simple notification number: ${simpleNotificationNumber} for workspace ${workspaceId}`
      );

      return simpleNotificationNumber;
    } catch (error) {
      logger.error(
        "[ReminderService] Error generating shared notification number:",
        error
      );
      throw error;
    }
  }

  private async sendGroupedNotification(
    reminder: any,
    sharedNotificationNumber: string
  ) {
    // اگر یادآور غیرفعال است، هیچ اعلانی ساخته نشود
    if (!reminder?.isActive) {
      logger.info(
        `[ReminderService] Skipping grouped notification creation because reminder ${reminder?.id} is inactive.`
      );
      return;
    }
    // واکشی workspaceUser به همراه user و role برای ارسال نوتیفیکیشن
    const workspaceUser = await prisma.workspaceUser.findUnique({
      where: { id: reminder.workspaceUserId },
      include: {
        user: true,
        role: true,
      },
    });

    if (!workspaceUser || !workspaceUser.user) {
      logger.warn(`WorkspaceUser not found for reminder ${reminder.id}`);
      return;
    }

    const message = `${reminder.title}\n${reminder.description || ""}${
      reminder.entityId ? `\nمربوط به آیتم شماره: ${reminder.entityId}` : ""
    }`;

    // ساخت یک آبجکت نوتیفیکیشن پایه با شماره مشترک
    const notificationData: any = {
      workspaceUser, // ارسال به پروفایل ورک‌اسپیسی
      title: "یادآوری: " + reminder.title,
      message: message,
      note: reminder.description,
      sendSms:
        reminder.notificationChannels === "SMS" ||
        reminder.notificationChannels === "ALL",
      sendEmail:
        reminder.notificationChannels === "EMAIL" ||
        reminder.notificationChannels === "ALL",
      reminderId: reminder.id, // اضافه کردن reminderId برای شناسایی اعلان‌های یادآور
      notificationNumber: sharedNotificationNumber, // استفاده از شماره مشترک
      notificationNumberName: sharedNotificationNumber, // استفاده از نام شماره مشترک
      status: "SENT", // وضعیت پیش‌فرض موفق
    };

    // فیلد requestId را فقط در صورت مرتبط بودن اضافه می‌کنیم
    if (reminder.entityType === "Request" && reminder.entityId) {
      notificationData.requestId = reminder.entityId;
    }

    logger.info(
      `[ReminderService] Creating grouped notification with shared number ${sharedNotificationNumber} for reminder ${reminder.id}`
    );

    // اضافه کردن workspaceId به notificationData
    notificationData.workspaceId = reminder.workspaceId;

    await this.notificationService.create(notificationData, {
      workspaceId: reminder.workspaceId,
      user: workspaceUser.user,
      role: workspaceUser.role || {
        name: "ADMIN",
        id: 1,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        workspaceId: reminder.workspaceId,
      }, // استفاده از نقش موجود یا پیش‌فرض
      workspaceUser: workspaceUser, // اضافه کردن workspaceUser
    });
  }

  private async sendNotification(reminder: any) {
    // اگر یادآور غیرفعال است، هیچ اعلانی ساخته نشود
    if (!reminder?.isActive) {
      logger.info(
        `[ReminderService] Skipping notification creation because reminder ${reminder?.id} is inactive.`
      );
      return;
    }
    // واکشی workspaceUser به همراه user برای ارسال نوتیفیکیشن
    const workspaceUser = await prisma.workspaceUser.findUnique({
      where: { id: reminder.workspaceUserId },
      include: { user: true },
    });

    if (!workspaceUser || !workspaceUser.user) {
      logger.warn(`WorkspaceUser not found for reminder ${reminder.id}`);
      return;
    }

    const message = `${reminder.title}\n${reminder.description || ""}${
      reminder.entityId ? `\nمربوط به آیتم شماره: ${reminder.entityId}` : ""
    }`;

    // ساخت یک آبجکت نوتیفیکیشن پایه
    const notificationData: any = {
      workspaceUser, // ارسال به پروفایل ورک‌اسپیسی
      title: "یادآوری: " + reminder.title,
      message: message,
      note: reminder.description,
      sendSms:
        reminder.notificationChannels === "SMS" ||
        reminder.notificationChannels === "ALL",
      sendEmail:
        reminder.notificationChannels === "EMAIL" ||
        reminder.notificationChannels === "ALL",
      reminderId: reminder.id, // اضافه کردن reminderId برای شناسایی اعلان‌های یادآور
      status: "SENT", // وضعیت پیش‌فرض موفق
    };

    // فیلد requestId را فقط در صورت مرتبط بودن اضافه می‌کنیم
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

    // اضافه کردن workspaceId به notificationData
    notificationData.workspaceId = reminder.workspaceId;

    await this.notificationService.create(notificationData, {
      workspaceId: reminder.workspaceId,
      user: workspaceUser.user,
    } as any);
  }

  async checkDueReminders(batchSize = 50, offset = 0) {
    try {
      const now = DateTime.now().setZone("Asia/Tehran").toJSDate();
      logger.info(
        `[ReminderService] Checking for reminders due before: ${now.toISOString()}`
      );

      const dueReminders = await this.repository.findAll({
        filters: {
          dueDate: { lte: now },
          notified: false,
          status: "PENDING",
          isActive: true, // فقط یادآورهای فعال
        },
        limit: batchSize,
        page: 1 + Math.floor(offset / batchSize),
      });

      logger.info(
        `[ReminderService] Found ${dueReminders.data.length} due reminders.`
      );

      let processedCount = 0;

      // گروه‌بندی یادآورها بر اساس reminderNumber
      const groupedReminders = new Map<string, any[]>();

      for (const reminder of dueReminders.data) {
        const groupKey = reminder.reminderNumber || `single_${reminder.id}`;
        if (!groupedReminders.has(groupKey)) {
          groupedReminders.set(groupKey, []);
        }
        groupedReminders.get(groupKey)!.push(reminder);
      }

      // پردازش هر گروه
      for (const [groupKey, reminders] of groupedReminders) {
        try {
          if (reminders.length === 1) {
            // یادآور تک‌کاربره
            await this.processReminder(reminders[0]);
            processedCount++;
          } else {
            // یادآور گروهی - همه را با یک شماره اعلان مشترک پردازش کن
            await this.processGroupedReminders(reminders);
            processedCount += reminders.length;
          }
        } catch (error: any) {
          if (error instanceof ValidationException) {
            logger.error(
              `[Validation failed] for reminder group ${groupKey}: ${JSON.stringify(
                error.errors,
                null,
                2
              )}`
            );
          } else {
            logger.error(
              `[ReminderService] Error processing reminder group ${groupKey}:`,
              error.message || error
            );
          }
          // در صورت خطا، هر یادآور را جداگانه پردازش کن
          for (const reminder of reminders) {
            try {
              await this.processReminder(reminder);
            } catch (individualError) {
              await this.handleReminderError(reminder);
            }
          }
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

  private async processGroupedReminders(reminders: any[]) {
    try {
      // تولید یک شماره اعلان مشترک برای همه یادآورهای گروهی
      const firstReminder = reminders[0];
      const notificationNumber = await this.generateSharedNotificationNumber(
        firstReminder.workspaceId
      );

      logger.info(
        `[ReminderService] Processing ${reminders.length} grouped reminders with shared notification number: ${notificationNumber}`
      );

      // ایجاد اعلان‌ها برای همه یادآورها با شماره مشترک
      const notificationPromises = reminders.map(async (reminder) => {
        await this.sendGroupedNotification(reminder, notificationNumber);
        await this.repository.update(reminder.id, {
          notified: true,
          lastNotified: new Date(),
          status: "COMPLETED",
        });
        if (reminder.repeatInterval) {
          await this.createNextReminder(reminder);
        }
      });

      await Promise.all(notificationPromises);

      logger.info(
        `[ReminderService] Successfully processed ${reminders.length} grouped reminders`
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

      // مستقیماً از ریپازیتوری برای ایجاد استفاده می‌کنیم (context نیاز نیست)
      await this.repository.create(newReminder as any);
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
