import { OrderSource, OrderStatus, PaymentMethod } from "@prisma/client";
import { z } from "zod";

export const createOrderSchema = z.object({
  workspaceUser: z.object(
    { id: z.number() },
    { required_error: "انتخاب کاربر الزامی است." }
  ),
  status: z.nativeEnum(OrderStatus).default(OrderStatus.NEW),
  source: z.nativeEnum(OrderSource).default(OrderSource.WEB),
  isOnline: z.boolean().default(true),
  subtotal: z.number().min(0),
  tax: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
  total: z.number().min(0),
  shippingCost: z.number().min(0).default(0),
  shippingMethodId: z.number().optional(),
  shippingAddress: z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  items: z
    .array(
      z.object({
        productId: z.number(),
        quantity: z.number().int().positive(),
        unitPrice: z.number().min(0),
        discount: z.number().min(0).default(0),
        tax: z.number().min(0).default(0),
        total: z.number().min(0),
      })
    )
    .min(1, "حداقل یک آیتم الزامی است."),
});

export const updateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  shippingMethodId: z.number().optional(),
  shippingAddress: z.string().optional(),
  shippingCost: z.number().min(0).optional(),
});

