// مسیر فایل: src/modules/workspace-users/validation/schema.ts

import { z } from "zod";

export const createWorkspaceUserSchema = z.object({
  name: z.string().min(1, "نام عضو الزامی است."),
  phone: z
    .string()
    .min(11, "شماره تلفن ۱۱ رقمی معتبر وارد کنید.")
    .max(11, "شماره تلفن معتبر نیست."),
  roleId: z.coerce.number({ required_error: "انتخاب نقش الزامی است." }),
  displayName: z.string().optional(),
  labels: z.array(z.number()).optional(), // آرایه‌ای از شناسه‌های برچسب‌ها
  userGroups: z.array(z.number()).optional(), // آرایه‌ای از شناسه‌های گروه‌ها
});

export const updateWorkspaceUserSchema = z.object({
  roleId: z.coerce.number({ required_error: "انتخاب نقش الزامی است." }),
  displayName: z.string().optional(),
  labels: z.array(z.number()).optional(),
  userGroups: z.array(z.number()).optional(),
});
