import { z } from "zod";

export const createDocumentSchema = z.object({
  originalName: z.string().min(1),
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().nonnegative(),
  url: z.string().min(1),
  type: z.string().optional().nullable(),
  category: z.object({ id: z.number().int().positive() }).optional().nullable(),
  entityType: z.string().optional().nullable(),
  entityId: z.number().int().positive().optional().nullable(),
});

export const updateDocumentSchema = z.object({
  originalName: z.string().min(1).optional(),
  type: z.string().optional().nullable(),
  category: z.object({ id: z.number().int().positive() }).optional().nullable(),
  entityType: z.string().optional().nullable(),
  entityId: z.number().int().positive().optional().nullable(),
});
