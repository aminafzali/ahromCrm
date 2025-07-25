// مسیر فایل: src/modules/requests/validation/schema.ts

import { z } from "zod";

const actualServiceOnRequestSchema = z.object({
  actualServiceId: z.number({ required_error: "انتخاب خدمت الزامی است" }),
  quantity: z.coerce.number().min(1, "تعداد باید حداقل ۱ باشد"),
  price: z.coerce.number().min(0, "قیمت نمی‌تواند منفی باشد"),
});

export const createRequestSchema = z.object({
  // شناسه سراسری کاربر (مشتری) را از فرم دریافت می‌کنیم
  userId: z.coerce.number({ required_error: "شناسایی مشتری الزامی است." }),

  // شناسه سراسری کاربر (کارشناس) که درخواست به او تخصیص داده می‌شود (اختیاری)
  assignedToId: z.coerce.number().optional().nullable(),

  // سایر فیلدهای فرم بدون تغییر
  id: z.number().optional(),
  serviceTypeId: z.coerce.number().min(1, "نوع خدمات الزامی است"),
  description: z.string().min(10, "توضیحات باید حداقل 10 کاراکتر باشد"),
  address: z.string().optional().nullable(),
  preferredDate: z.string().optional().nullable(),
  preferredTime: z.string().optional().nullable(),
  statusId: z.coerce.number().min(1, "وضعیت الزامی است"),
  formSubmissionid: z.number().optional().nullable(),
  formData: z.any().optional().nullable(),
  actualServices: z.array(actualServiceOnRequestSchema).optional(),
});

export const updateRequestSchema = createRequestSchema.partial();

// این اسکیماها بدون تغییر باقی می‌مانند
export const updateRequestStatusSchema = z.object({
  statusId: z.number().min(1, "وضعیت الزامی است"),
  note: z.string().optional(),
  sendSms: z.boolean().default(true),
});

export const addNoteSchema = z.object({
  content: z.string().min(1, "متن یادداشت الزامی است"),
});
