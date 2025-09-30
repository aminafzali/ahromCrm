import { z } from "zod";

export const createBrandSchema = z.object({
  name: z.string().min(1, "نام برند الزامی است"),
  description: z.string().optional(),
});

export const updateBrandSchema = createBrandSchema;