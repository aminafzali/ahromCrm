// مسیر فایل: src/app/@Server/services/reminders/validation/schema.ts

import { z } from "zod";

export const createReminderSchema = z.object({
  title: z
    .string()
    .min(3, { message: "عنوان یادآور باید حداقل ۳ کاراکتر باشد." }),
  description: z.string().max(1000).optional(),
  dueDate: z.coerce.date({
    required_error: "لطفاً تاریخ و زمان یادآوری را انتخاب کنید.",
    invalid_type_error: "فرمت تاریخ و زمان نامعتبر است.",
  }),
  workspaceUserId: z.coerce.number({
    required_error: "انتخاب کاربر الزامی است.",
    invalid_type_error: "شناسه کاربر نامعتبر است.",
  }),
  // ++ اصلاحیه کلیدی: اضافه کردن فیلد type به اسکیما ++
  // ما می‌توانیم یک مقدار پیش‌فرض برای آن در نظر بگیریم.
  type: z.string().default("General"),

  // فیلدهای اختیاری دیگر
  entityId: z.number().optional(),
  entityType: z.string().optional(),
  notificationChannels: z
    .enum(["SMS", "EMAIL", "IN_APP", "ALL"])
    .default("ALL"),
});

// اسکیمای قبلی
// export const createReminderSchema = z.object({
//   title: z.string().min(1, "عنوان یادآوری الزامی است"),
//   description: z.string().optional(),
//   dueDate: z.string().min(1, "تاریخ یادآوری الزامی است"),
//   entityId: z.number().min(1, "شناسه موجودیت الزامی است"),
//   entityType: z.string().min(1, "نوع موجودیت الزامی است"),
//   userId: z.number().min(1, "شناسه کاربر الزامی است"),
// });
