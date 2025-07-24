// مسیر فایل: src/modules/roles/validation/schema.ts

import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(1, "نام نقش الزامی است."),
  description: z.string().optional(),
});

export const updateRoleSchema = createRoleSchema.partial();
