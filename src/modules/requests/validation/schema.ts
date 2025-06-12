import { z } from "zod";

export const createRequestSchema = z.object({
  id: z.number().optional(),
  userId: z.number().min(1, "شناسه کاربر الزامی است"),
  serviceTypeId: z.number().min(1, "نوع خدمات الزامی است"),
  description: z.string().min(10, "توضیحات باید حداقل 10 کاراکتر باشد"),
  address: z.string().optional(),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  statusId: z.number().min(1, "وضعیت الزامی است"),
  formSubmissionid: z.number().optional().nullable(),
  formData: z.any().optional().nullable(),
});

export const updateRequestStatusSchema = z.object({
  statusId: z.number().min(1, "وضعیت الزامی است"),
  note: z.string().optional(),
  sendSms: z.boolean().default(true)
});

export const addNoteSchema = z.object({
  content: z.string().min(1, "متن یادداشت الزامی است"),
});