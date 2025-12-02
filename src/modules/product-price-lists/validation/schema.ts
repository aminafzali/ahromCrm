import { z } from "zod";

// اسکیمای ساخت لیست قیمت جدید
export const createPriceListSchema = z.object({
  productId: z.number().min(1, "شناسه محصول الزامی است"),
  userGroupId: z.number().min(1, "شناسه گروه کاربری الزامی است"),
  price: z.number().min(0, "قیمت نمی‌تواند منفی باشد"),
  discountPrice: z.number().min(0).optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  discountStartDate: z.coerce.date().optional(),
  discountEndDate: z.coerce.date().optional(),
  isActive: z.boolean().default(true),
});

// اسکیمای ویرایش لیست قیمت (تمام فیلدها اختیاری هستند)
export const updatePriceListSchema = z.object({
  price: z.number().min(0).optional(),
  discountPrice: z.number().min(0).optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  discountStartDate: z.coerce.date().optional(),
  discountEndDate: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
});

// اسکیمای bulk update (برای به‌روزرسانی دسته‌جمعی)
export const bulkPriceListSchema = z.object({
  productIds: z.array(z.number().min(1)),
  userGroupId: z.number().min(1),
  priceModifier: z.object({
    type: z.enum(["FIXED", "PERCENTAGE"]),
    value: z.number(),
  }),
});
