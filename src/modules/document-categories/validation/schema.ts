import { z } from "zod";

export const createDocumentCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  parent: z.object({ id: z.number().int().positive() }).optional().nullable(),
});

export const updateDocumentCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  parent: z.object({ id: z.number().int().positive() }).optional().nullable(),
});
