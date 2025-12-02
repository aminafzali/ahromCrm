import { z } from "zod";

// اسکیمای attributes (JSON object)
export const variantAttributesSchema = z.record(
  z.string(),
  z.union([z.string(), z.number()])
);

// اسکیمای ساخت واریانت جدید
export const createProductVariantSchema = z.object({
  productId: z.number().min(1, "شناسه محصول الزامی است"),
  name: z.string().optional(),
  sku: z.string().optional(),
  price: z.number().min(0, "قیمت نمی‌تواند منفی باشد"),
  stock: z.number().int().min(0, "موجودی نمی‌تواند منفی باشد").default(0),
  attributes: variantAttributesSchema,
  images: z.array(z.string().url()).optional(),
  isActive: z.boolean().default(true),
  weight: z.number().min(0).optional(),
  length: z.number().min(0).optional(),
  width: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
});

// اسکیمای ویرایش واریانت (تمام فیلدها اختیاری هستند)
export const updateProductVariantSchema = z.object({
  name: z.string().optional(),
  sku: z.string().optional(),
  price: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  attributes: variantAttributesSchema.optional(),
  images: z.array(z.string().url()).optional(),
  isActive: z.boolean().optional(),
  weight: z.number().min(0).optional(),
  length: z.number().min(0).optional(),
  width: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
});
