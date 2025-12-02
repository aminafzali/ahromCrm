import { z } from "zod";

// اسکیمای آیتم‌های سفارش خرید
export const purchaseOrderItemSchema = z.object({
  productId: z.number().min(1, "انتخاب محصول الزامی است"),
  quantity: z.number().min(1, "تعداد باید حداقل 1 باشد"),
  unitPrice: z.number().min(0, "قیمت واحد نمی‌تواند منفی باشد"),
  total: z.number().min(0, "مبلغ کل نمی‌تواند منفی باشد").optional(),
});

// اسکیمای پایه برای فیلدهای مشترک
const basePurchaseOrderSchema = z.object({
  supplierWorkspaceUserId: z.number().optional().nullable(),
  status: z.string().default("PENDING"),
  notes: z.string().optional().nullable(),
  items: z
    .array(purchaseOrderItemSchema)
    .min(1, "حداقل یک آیتم باید وجود داشته باشد"),
});

// اسکیمای ساخت سفارش خرید جدید
export const createPurchaseOrderSchema = basePurchaseOrderSchema;

// اسکیمای ویرایش سفارش خرید (تمام فیلدها اختیاری هستند)
export const updatePurchaseOrderSchema = basePurchaseOrderSchema
  .partial()
  .extend({
    status: z.string().optional(),
  });

// اسکیمای تغییر وضعیت سفارش خرید
export const updatePurchaseOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "RECEIVED", "CANCELED"]),
  note: z.string().optional(),
});

