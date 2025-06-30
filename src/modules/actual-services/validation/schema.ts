// مسیر فایل: src/modules/actual-services/validation/schema.ts

import { z } from "zod";

export const createActualServiceSchema = z.object({
  name: z.string().min(1, "نام خدمت الزامی است."),
  price: z.coerce.number().min(0, "قیمت نمی‌تواند منفی باشد."),
  serviceTypeId: z.coerce.number().min(1, "انتخاب نوع خدمت الزامی است."),
  description: z.string().optional(),
});

export const updateActualServiceSchema = createActualServiceSchema;
