// مسیر فایل: src/modules/notifications/validation/schema.ts

import { z } from "zod";

export const createNotificationSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است."),
  message: z.string().min(1, "متن پیام الزامی است."),

  // ===== شروع اصلاحیه کلیدی =====
  // به جای انتظار برای یک عدد، اکنون منتظر یک آبجکت هستیم
  // که نماینده پروفایل ورک‌اسپیسی کاربر است.
  workspaceUser: z.object(
    { id: z.coerce.number() }, // فقط به شناسه آن برای اتصال نیاز داریم
    { required_error: "انتخاب کاربر الزامی است." }
  ),
  // ===== پایان اصلاحیه کلیدی =====

  requestId: z.number().optional().nullable(),
  sendSms: z.boolean().optional().default(true),
  sendEmail: z.boolean().optional().default(false),
});

export const updateNotificationSchema = z.object({
  isRead: z.boolean(),
});
