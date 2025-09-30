import { z } from "zod";

export const createServiceTypeSchema = z.object({
  name: z.string().min(1, "نام خدمت الزامی است"),
  description: z.string().optional(),
  basePrice: z.any(),
  isActive: z.boolean().default(true),
});