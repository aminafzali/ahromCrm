// مسیر فایل: src/modules/payment-categories/validation/schema.ts

import { z } from "zod";

export const createPaymentCategorySchema = z.object({
  name: z.string().min(1, "نام دسته‌بندی الزامی است"),
  slug: z.string().min(1, "اسلاگ الزامی است"),
  description: z.string().optional().nullable(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"], {
    required_error: "نوع دسته‌بندی الزامی است.",
  }),
  parent: z.object({ id: z.number() }).optional().nullable(),
});

export const updatePaymentCategorySchema =
  createPaymentCategorySchema.partial();
