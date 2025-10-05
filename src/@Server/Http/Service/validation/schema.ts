// مسیر فایل: src/app/@Server/services/reminders/validation/schema.ts

import { z } from "zod";

export const createReminderSchema = z
  .object({
    title: z
      .string()
      .min(3, { message: "عنوان یادآور باید حداقل ۳ کاراکتر باشد." }),
    description: z.string().max(1000).optional(),
    dueDate: z.coerce.date({
      required_error: "لطفاً تاریخ و زمان یادآوری را انتخاب کنید.",
      invalid_type_error: "فرمت تاریخ و زمان نامعتبر است.",
    }),
    status: z
      .enum(["PENDING", "COMPLETED", "CANCELLED", "FAILED"]) // پوشش حالت‌های سرویس
      .optional(),
    // پذیرش هر دو حالت: workspaceUser یا workspaceUserId (حداقل یکی الزامی است)
    workspaceUser: z
      .object({
        id: z.coerce.number({
          required_error: "انتخاب کاربر الزامی است.",
          invalid_type_error: "شناسه کاربر نامعتبر است.",
        }),
      })
      .optional(),
    workspaceUserId: z.coerce.number().optional(),
    // ++ اصلاحیه کلیدی: اضافه کردن فیلد type به اسکیما ++
    // ما می‌توانیم یک مقدار پیش‌فرض برای آن در نظر بگیریم.
    type: z.string().default("General"),

    // فیلدهای اختیاری دیگر
    entityId: z.number().optional(),
    entityType: z.string().optional(),
    notificationChannels: z
      .union([
        z.enum(["SMS", "EMAIL", "IN_APP", "ALL"]),
        z.array(z.enum(["SMS", "EMAIL", "IN_APP", "ALL"])),
      ])
      .default("ALL"),
    requestId: z.number().optional(),
    invoiceId: z.number().optional(),
    paymentId: z.number().optional(),
    taskId: z.number().optional(),
    repeatInterval: z
      .enum(["NONE", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"]) // هم‌راستا با فرم کلاینت
      .optional(),
    timezone: z.string().optional().default("Asia/Tehran"),
    // گیرندگان گروهی و فیلترها برای ایجاد گروهی
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
  })
  .superRefine((data, ctx) => {
    // الزام: یکی از workspaceUser/workspaceUserId یا سناریوی گروهی باید وجود داشته باشد
    const hasSingle = !!data.workspaceUserId || !!data.workspaceUser?.id;
    const hasGroup =
      (data.recipients && data.recipients.length > 0) ||
      !!data.filters?.selectFiltered;
    if (!hasSingle && !hasGroup) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["workspaceUserId"],
        message: "گیرنده معتبر انتخاب نشده است.",
      });
    }
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
