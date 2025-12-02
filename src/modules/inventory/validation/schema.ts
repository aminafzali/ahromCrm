import { StockMovementType } from "@prisma/client";
import { z } from "zod";

export const adjustStockSchema = z.object({
  warehouseId: z.number({ required_error: "انتخاب انبار الزامی است." }),
  productId: z.number({ required_error: "انتخاب محصول الزامی است." }),
  quantity: z.number().int("مقدار باید عدد صحیح باشد"),
  movementType: z.nativeEnum(StockMovementType, {
    required_error: "نوع حرکت الزامی است.",
  }),
  invoiceId: z.number().optional(),
  orderId: z.number().optional(),
  purchaseOrderId: z.number().optional(),
  description: z.string().optional(),
});

export const transferStockSchema = z.object({
  fromWarehouseId: z.number({
    required_error: "انتخاب انبار مبدا الزامی است.",
  }),
  toWarehouseId: z.number({ required_error: "انتخاب انبار مقصد الزامی است." }),
  items: z
    .array(
      z.object({
        productId: z.number(),
        quantity: z.number().int().positive("مقدار باید مثبت باشد"),
      })
    )
    .min(1, "حداقل یک آیتم الزامی است."),
  description: z.string().optional(),
});

export const getProductStockSchema = z.object({
  productId: z.number(),
  warehouseId: z.number().optional(),
});
