import { z } from "zod";

export const createWarehouseSchema = z.object({
  name: z.string().min(1, "نام انبار الزامی است"),
  address: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateWarehouseSchema = z.object({
  name: z.string().min(1, "نام انبار الزامی است").optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

