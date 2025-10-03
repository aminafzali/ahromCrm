// مسیر فایل: src/modules/reminders/validation/schema.ts

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
  workspaceUser: z
    .object({
      id: z.coerce.number({
        required_error: "انتخاب کاربر الزامی است.",
        invalid_type_error: "شناسه کاربر نامعتبر است.",
      }),
    })
    .optional(),
  // اضافه کردن workspaceUserId برای سازگاری با Prisma
  workspaceUserId: z.coerce.number().optional(),
  // ++ اصلاحیه کلیدی: اضافه کردن فیلد type به اسکیما ++
  // ما می‌توانیم یک مقدار پیش‌فرض برای آن در نظر بگیریم.
  type: z.string().default("General"),

  // فیلدهای اختیاری دیگر
  entityId: z.number().optional(),
  entityType: z.string().optional(),
  notificationChannels: z
    .enum(["SMS", "EMAIL", "IN_APP", "ALL"])
    .default("IN_APP"),
  repeatInterval: z.string().optional(),
  timezone: z.string().optional(),
  status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]).optional(),
  requestId: z.number().optional(),
  invoiceId: z.number().optional(),
  paymentId: z.number().optional(),
  taskId: z.number().optional(),
  // گیرندگان گروهی و فیلترها برای ارسال گروهی
  recipients: z
    .array(
      z.object({
        workspaceUserId: z.coerce.number(),
      })
    )
    .optional(),
  filters: z
    .object({
      groupIds: z.array(z.coerce.number()).optional(),
      labelIds: z.array(z.coerce.number()).optional(),
      q: z.string().optional(),
      selectFiltered: z.boolean().optional(),
    })
    .optional(),
});
