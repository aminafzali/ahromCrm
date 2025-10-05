// مسیر فایل: src/modules/reminders/service/ReminderServiceApi.ts

import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { FullQueryParams, PaginationResult } from "@/@Server/types";
import prisma from "@/lib/prisma";
import { connects, include, relations, searchFileds } from "../data/fetch";
import {
  createReminderSchema,
  updateReminderSchema,
} from "../validation/schema";

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
      updateReminderSchema,
      searchFileds,
      relations
    );
    this.connect = connects;
    this.repository = new Repository();
  }

  protected beforeCreate = async (data: any): Promise<any> => {
    console.log("🔍 [ReminderServiceApi] beforeCreate called with data:", {
      recipients: data.recipients?.length || 0,
      filters: data.filters,
      workspaceUser: data.workspaceUser?.id,
      workspaceId: data.workspaceId,
    });

    const { recipients, filters, workspaceUser } = data;

    // بررسی workspaceId
    if (!data.workspaceId) {
      console.error("🔍 [ReminderServiceApi] workspaceId is missing!");
      throw new Error("workspaceId is required");
    }

    // استفاده از شماره یادآور که از فرم آمده یا تولید جدید
    let reminderNumber = data.reminderNumber;
    let reminderNumberName = data.reminderNumberName;

    if (!reminderNumber || !reminderNumberName) {
      const generated = await this.generateReminderNumber(data.workspaceId);
      reminderNumber = generated.reminderNumber;
      reminderNumberName = generated.reminderNumberName;
    }

    const groupName = this.generateGroupName(data, reminderNumber);

    // استخراج workspaceUserId
    if (workspaceUser?.id) {
      data.workspaceUserId = workspaceUser.id;
      delete data.workspaceUser;
    }

    // اضافه کردن فیلدهای گروه‌بندی
    data.reminderNumber = reminderNumber?.toString();
    data.reminderNumberName = reminderNumberName;
    data.groupName = groupName;

    console.log(
      "🔍 [ReminderServiceApi] Generated reminder number:",
      reminderNumber
    );
    console.log("🔍 [ReminderServiceApi] Generated group name:", groupName);

    // اگر فقط یک کاربر هست، ارسال عادی
    if ((!recipients || recipients.length === 0) && !filters) {
      console.log(
        "🔍 [ReminderServiceApi] Single user or no recipients, returning data with number and group"
      );
      return data;
    }

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
      reminderNumber: data.reminderNumber?.toString(), // اضافه کردن شماره یادآور
      reminderNumberName: data.reminderNumberName, // اضافه کردن نام شماره یادآور
      groupName: data.groupName, // اضافه کردن نام گروه
    };

    // ارسال به لیست دستی
    if (Array.isArray(recipients) && recipients.length > 0) {
      console.log(
        `🔍 [ReminderServiceApi] Creating ${
          recipients.length - 1
        } additional reminders for recipients 2-${recipients.length}`
      );

      // ایجاد یادآور برای همه به جز اولین
      for (let i = 1; i < recipients.length; i++) {
        console.log(
          `🔍 [ReminderServiceApi] Creating reminder ${i + 1}/${
            recipients.length
          } for workspaceUserId: ${recipients[i].workspaceUserId}`
        );
        await this.repository.create({
          ...baseData,
          workspaceUserId: recipients[i].workspaceUserId,
        });
      }

      console.log(
        `🔍 [ReminderServiceApi] Returning first recipient for BaseService to handle: ${recipients[0].workspaceUserId}`
      );
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

    console.log(
      "🔍 [ReminderServiceApi] No recipients or filters, returning original data"
    );
    return data;
  };

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
   * Process groupIds, labelIds, and groupName filters for reminders
   */
  private processGroupLabelFilters(filters: any): any {
    if (!filters) return {};

    const { groupIds, labelIds, groupName, ...otherFilters } = filters;
    const processedFilters = { ...otherFilters };

    // Handle groupName filter (individual/grouped)
    if (groupName) {
      if (groupName === "individual") {
        processedFilters.groupName = null; // یادآورهای فردی
      } else if (groupName === "grouped") {
        processedFilters.groupName = { not: null }; // یادآورهای گروهی
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
   * تولید شماره یادآور خودکار (مثل فاکتورها)
   * این متد فقط در صورتی استفاده می‌شود که شماره از فرم نیامده باشد
   */
  private async generateReminderNumber(
    workspaceId: number
  ): Promise<{ reminderNumber: number; reminderNumberName: string }> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // پیدا کردن آخرین شماره برای این ماه و workspace
    const lastNumber = await prisma.reminderNumber.findFirst({
      where: { year, month, workspaceId },
      orderBy: { number: "desc" },
    });

    const nextNumber = lastNumber ? lastNumber.number + 1 : 1;

    // ذخیره شماره جدید
    await prisma.reminderNumber.create({
      data: { year, month, number: nextNumber, workspaceId },
    });

    const reminderNumberName = `RE-${year}${month
      .toString()
      .padStart(2, "0")}${nextNumber.toString().padStart(4, "0")}`;

    return {
      reminderNumber: nextNumber,
      reminderNumberName,
    };
  }

  /**
   * تولید نام گروه بر اساس عنوان، موضوع و شماره یادآور
   */
  private generateGroupName(data: any, reminderNumber: number): string {
    let groupName = data.title;

    // اضافه کردن اطلاعات موضوع
    if (data.entityType && data.entityType !== "GENERAL") {
      groupName += ` - ${data.entityType}`;
    }

    // اضافه کردن شماره یادآور
    groupName += ` - ${reminderNumber}`;

    return groupName;
  }

  /**
   * دریافت گروه‌های یادآور (یادآورهای گروه‌بندی شده)
   */
  async getGroupedReminders(params: any) {
    try {
      const { page = 1, limit = 10, filters = {} } = params;

      // اگر reminderNumber مشخص شده، فقط یادآورهای آن گروه را برگردان
      if (filters.reminderNumber) {
        const result = await this.repository.findAll({
          page: 1,
          limit: 1000, // برای جزئیات گروه، همه یادآورهای آن گروه را بگیر
          filters: {
            ...filters,
            reminderNumber: filters.reminderNumber,
          },
          include: include,
          search: filters.search || "",
          searchFields: searchFileds,
        });

        // اگر یادآوری پیدا شد، آن را به فرمت گروه تبدیل کن
        if (result.data.length > 0) {
          const firstReminder = result.data[0];
          const group = {
            reminderNumber: firstReminder.reminderNumber,
            groupName: firstReminder.groupName,
            title: firstReminder.title,
            entityType: firstReminder.entityType,
            dueDate: firstReminder.dueDate,
            status: firstReminder.status,
            userCount: result.data.length,
            reminders: result.data,
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

      // دریافت همه یادآورهای گروهی (فقط آنهایی که reminderNumber دارند)
      const result = await this.repository.findAll({
        page,
        limit,
        filters: {
          ...filters,
          reminderNumber: { not: null }, // فقط یادآورهایی که شماره دارند
        },
        include: include,
        search: filters.search || "",
        searchFields: searchFileds,
      });

      // گروه‌بندی بر اساس reminderNumber
      const groupedMap = new Map();

      result.data.forEach((reminder: any) => {
        const key = reminder.reminderNumber;
        if (!key) return;

        if (!groupedMap.has(key)) {
          groupedMap.set(key, {
            reminderNumber: reminder.reminderNumber,
            groupName: reminder.groupName,
            title: reminder.title,
            entityType: reminder.entityType,
            dueDate: reminder.dueDate,
            status: reminder.status,
            userCount: 0,
            reminders: [],
          });
        }

        const group = groupedMap.get(key);
        group.userCount++;
        group.reminders.push(reminder);
      });

      // تبدیل به آرایه و مرتب‌سازی
      const groupedData = Array.from(groupedMap.values()).sort(
        (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      );

      return {
        data: groupedData,
        pagination: result.pagination,
      };
    } catch (error) {
      console.error("Error fetching grouped reminders:", error);
      throw error;
    }
  }
}
