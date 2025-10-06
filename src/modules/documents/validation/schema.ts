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
  // متادیتا: اجازه همه انواع به صورت رشته، پیش‌فرض توسط کلاینت مدیریت می‌شود
  type: z.string().optional().nullable(),
  category: relatedEntity.optional().nullable(),
  entityType: z.string().optional().nullable(),
  entityId: z.coerce.number().int().positive().optional().nullable(),
});

export const updateDocumentSchema = z.object({
  originalName: z.string().min(1).optional(),
  type: z.string().optional().nullable(),
  category: relatedEntity.optional().nullable(),
  entityType: z.string().optional().nullable(),
  entityId: z.coerce.number().int().positive().optional().nullable(),
});
