// مسیر فایل: src/modules/projects/validation/schema.ts

import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "نام پروژه الزامی است."),
  description: z.string().optional(),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  status: z.object(
    { id: z.coerce.number() },
    { required_error: "انتخاب وضعیت الزامی است." }
  ),
  assignedUsers: z.array(z.object({ id: z.number() })).optional(),
  assignedTeams: z.array(z.object({ id: z.number() })).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, "نام پروژه الزامی است.").optional(),
  description: z.string().optional(),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  status: z.object({ id: z.coerce.number() }).optional(),
  assignedUsers: z.array(z.object({ id: z.number() })).optional(),
  assignedTeams: z.array(z.object({ id: z.number() })).optional(),
});
