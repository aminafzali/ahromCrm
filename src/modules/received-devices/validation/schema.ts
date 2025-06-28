// src/modules/received-devices/validation/schema.ts

import { z } from "zod";

const baseSchema = z.object({
  model: z.string().optional().nullable(),
  // serialNumber: z.string().optional().nullable(),
  problemDescription: z.string().min(1, "توضیح مشکل الزامی است."),
  initialCondition: z.string().min(1, "شرح وضعیت ظاهری اولیه الزامی است."),
  // notes: z.string().optional().nullable(),
});

export const createReceivedDeviceSchema = baseSchema.extend({
  // این فیلد اختیاری است و می‌تواند null باشد
  request: z.object({ id: z.number() }).optional().nullable(),

  // ▼▼▼ اصلاح اصلی در اینجا اعمال شده است ▼▼▼
  // این فیلدها اجباری هستند و دیگر نباید nullable باشند
  user: z.object(
    { id: z.number() },
    { required_error: "انتخاب مشتری الزامی است." }
  ),
  deviceType: z.object(
    { id: z.number() },
    { required_error: "انتخاب نوع دستگاه الزامی است." }
  ),
  brand: z.object(
    { id: z.number() },
    { required_error: "انتخاب برند الزامی است." }
  ),
});

export const updateReceivedDeviceSchema = baseSchema.extend({
  // در حالت ویرایش، این فیلدها می‌توانند اختیاری باشند
  request: z.object({ id: z.number() }).optional().nullable(),
  user: z.object({ id: z.number() }).optional().nullable(),
  deviceType: z.object({ id: z.number() }).optional().nullable(),
  brand: z.object({ id: z.number() }).optional().nullable(),
});
