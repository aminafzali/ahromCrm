// مسیر فایل: src/modules/workspace-users/validation/schema.ts

import { z } from "zod";

export const createWorkspaceUserSchema = z.object({
  name: z.string().min(1, "نام عضو الزامی است."),
  phone: z
    .string()
    .min(11, "شماره تلفن ۱۱ رقمی معتبر وارد کنید.")
    .max(11, "شماره تلفن معتبر نیست."),

  // نقش به صورت آبجکت با شناسه
  role: z.object(
    { id: z.coerce.number() },
    { required_error: "انتخاب نقش الزامی است." }
  ),

  displayName: z.string().optional(),
  labels: z.array(z.object({ id: z.number() })).optional(),
  userGroupId: z.number().optional(), // تغییر به one-to-one

  // فیلدهای تکمیلی
  address: z.string().optional(),
  postalCode: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  economicCode: z.string().optional(),
  registrationNumber: z.string().optional(),
  nationalId: z.string().optional(),

  // به صورت متن چندخطی، در سرویس به Json (آرایه) تبدیل می‌شود
  otherPhones: z.string().optional(),
  bankAccounts: z.string().optional(),

  description: z.string().optional(),
});

export const updateWorkspaceUserSchema = z.object({
  role: z.object(
    { id: z.coerce.number() },
    { required_error: "انتخاب نقش الزامی است." }
  ),
  displayName: z.string().optional(),
  labels: z.array(z.object({ id: z.number() })).optional(),
  userGroupId: z.number().optional(), // تغییر به one-to-one

  address: z.string().optional(),
  postalCode: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  economicCode: z.string().optional(),
  registrationNumber: z.string().optional(),
  nationalId: z.string().optional(),
  otherPhones: z.string().optional(),
  bankAccounts: z.string().optional(),
  description: z.string().optional(),
});
