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
  // ===== پایان اصلاحیه کلیدی =====
  requestId: z.number().optional().nullable(),
  sendSms: z.boolean().optional().default(true),
  sendEmail: z.boolean().optional().default(false),
});

export const updateNotificationSchema = z.object({
  isRead: z.boolean(),
});
