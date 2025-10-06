import { z } from "zod";

const relatedEntity = z
  .object({ id: z.coerce.number().int().positive() })
  .passthrough();

export const createDocumentSchema = z.object({
  // اطلاعات فایل (پر می‌شود بعد از آپلود موفق)
  originalName: z.string().min(1),
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.coerce.number().int().nonnegative(),
  url: z.string().min(1),
  // متادیتا
  type: z.enum(["image", "pdf", "doc", "other"]).optional().nullable(),
  category: relatedEntity.optional().nullable(),
  entityType: z
    .enum(["project", "task", "user", "invoice", "request"])
    .optional()
    .nullable(),
  entityId: z.coerce.number().int().positive().optional().nullable(),
});

export const updateDocumentSchema = z.object({
  originalName: z.string().min(1).optional(),
  type: z.enum(["image", "pdf", "doc", "other"]).optional().nullable(),
  category: relatedEntity.optional().nullable(),
  entityType: z
    .enum(["project", "task", "user", "invoice", "request"])
    .optional()
    .nullable(),
  entityId: z.coerce.number().int().positive().optional().nullable(),
});
