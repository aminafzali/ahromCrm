// مسیر فایل: src/modules/notifications/validation/schema.ts

import { z } from "zod";

export const createNotificationSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است."),
  message: z.string().min(1, "متن پیام الزامی است."),

  // ===== شروع اصلاحیه کلیدی =====
  // این فیلد اکنون به صورت اختیاری تعریف شده تا با مدل پریزما هماهنگ باشد
  workspaceUser: z
    .object({
      id: z.coerce.number(),
    })
    .optional()
    .nullable(),
  // اضافه کردن workspaceUserId برای سازگاری با Prisma
  workspaceUserId: z.coerce.number().optional(),
  // شماره اعلان و نام آن
  notificationNumber: z.string().optional(),
  notificationNumberName: z.string().optional(),
  groupName: z.string().optional(),
  // ===== پایان اصلاحیه کلیدی =====
  // گیرندگان گروهی اختیاری
  recipients: z
    .array(
      z.object({
        workspaceUserId: z.coerce.number(),
        channel: z.enum(["ALL", "IN_APP", "SMS", "EMAIL"]).optional(),
      })
    )
    .optional(),
  // فیلترهای اختیاری برای انتخاب مخاطبین در سمت سرور
  filters: z
    .object({
      groupIds: z.array(z.coerce.number()).optional(),
      labelIds: z.array(z.coerce.number()).optional(),
      q: z.string().optional(),
      selectFiltered: z.boolean().optional(),
    })
    .optional(),
  requestId: z.number().optional().nullable(),
  invoiceId: z.number().optional().nullable(),
  reminderId: z.number().optional().nullable(),
  paymentId: z.number().optional().nullable(),
  sendSms: z.boolean().optional().default(true),
  sendEmail: z.boolean().optional().default(false),
});

export const updateNotificationSchema = z.object({
  isRead: z.boolean(),
});
