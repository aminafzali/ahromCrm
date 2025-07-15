// مسیر فایل: src/modules/notifications/validation/schema.ts

import { z } from "zod";

export const createNotificationSchema = z.object({
  userId: z.number().min(1, "شناسه کاربر الزامی است"),
  // ++ اصلاحیه کلیدی: اضافه کردن .nullable() برای پذیرش مقدار null ++
  requestId: z.number().optional().nullable(),
  title: z.string().min(1, "عنوان اعلان الزامی است"),
  message: z.string().min(1, "متن پیام الزامی است"),
  note: z.string().optional().nullable(), // این فیلد را نیز برای هماهنگی بیشتر nullable می‌کنیم
  isRead: z.boolean().default(false),
  sendSms: z.boolean().default(true),
  sendEmail: z.boolean().default(false), // این فیلد در مدل شما بود و باید در اسکیما باشد
});

// قبلی
// import { z } from "zod";

// export const createNotificationSchema = z.object({
//   userId: z.number().min(1, "شناسه کاربر الزامی است"),
//   requestId: z.number().optional(),
//   title: z.string().min(1, "عنوان اعلان الزامی است"),
//   message: z.string().min(1, "متن پیام الزامی است"),
//   isRead: z.boolean().default(false),
//   sendSms: z.boolean().default(true),
// });
