// مسیر فایل: src/modules/teams/validation/schema.ts

import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().min(1, "نام تیم الزامی است."),
  description: z.string().optional(),
  members: z.array(z.object({ id: z.number() })).optional(),
  parentId: z.number().optional().nullable(),
});

export const updateTeamSchema = z.object({
  name: z.string().min(1, "نام تیم الزامی است.").optional(),
  description: z.string().optional(),
  members: z.array(z.object({ id: z.number() })).optional(),
  parentId: z.number().optional().nullable(),
});
