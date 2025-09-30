import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "نام دسته‌بندی الزامی است"),
  slug: z.string().min(1, "نامک الزامی است"),
  parent: z.any().optional().nullable(),
});

export const updateCategorySchema = createCategorySchema;