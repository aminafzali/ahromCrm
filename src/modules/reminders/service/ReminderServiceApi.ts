// مسیر فایل: src/modules/reminders/service/ReminderServiceApi.ts

import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { connects, relations, searchFileds } from "../data/fetch";
import { createReminderSchema } from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("Reminder");
  }
}

export class ReminderServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      createReminderSchema,
      createReminderSchema,
      searchFileds,
      relations
    );
    this.connect = connects;
    this.repository = new Repository();
    this.beforeCreate = this.handleBeforeCreate;
  }

  protected handleBeforeCreate = async (data: any): Promise<any> => {
    const { recipients, filters, workspaceUser } = data;

    // استخراج workspaceUserId
    if (workspaceUser?.id) {
      data.workspaceUserId = workspaceUser.id;
      delete data.workspaceUser;
    }

    // اگر فقط یک کاربر هست، ارسال عادی
    if (!recipients && !filters) return data;

    // داده‌های پایه برای کپی کردن
    const baseData: any = {
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      status: data.status,
      type: data.type,
      entityId: data.entityId,
      entityType: data.entityType,
      requestId: data.requestId,
      invoiceId: data.invoiceId,
      paymentId: data.paymentId,
      taskId: data.taskId,
      notified: data.notified,
      repeatInterval: data.repeatInterval,
      timezone: data.timezone,
      notificationChannels: data.notificationChannels,
      workspaceId: data.workspaceId, // مهم: اضافه کردن workspaceId
    };

    // ارسال به لیست دستی
    if (Array.isArray(recipients) && recipients.length > 0) {
      // ایجاد یادآور برای همه به جز اولین
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

    // ارسال بر اساس فیلتر
    if (filters) {
      const { groupIds = [], labelIds = [], q = "", selectFiltered } = filters;
      if (selectFiltered) {
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
}
