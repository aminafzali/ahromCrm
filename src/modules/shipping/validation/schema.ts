import { ShippingMethodType } from "@prisma/client";
import { z } from "zod";

export const createShippingMethodSchema = z.object({
  name: z.string().min(1, "نام روش ارسال الزامی است."),
  type: z.nativeEnum(ShippingMethodType, {
    required_error: "نوع روش ارسال الزامی است.",
  }),
  basePrice: z.number().min(0, "قیمت پایه باید مثبت باشد"),
  isActive: z.boolean().default(true),
  settings: z.record(z.any()).optional(), // برای فرمول‌های پیچیده‌تر
});

export const updateShippingMethodSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.nativeEnum(ShippingMethodType).optional(),
  basePrice: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
  settings: z.record(z.any()).optional(),
});

export const calculateShippingCostSchema = z.object({
  shippingMethodId: z.number(),
  items: z
    .array(
      z.object({
        productId: z.number(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
  zone: z
    .object({
      province: z.string().optional(),
      city: z.string().optional(),
    })
    .optional(),
});
