// مسیر فایل: src/modules/workspace-users/validation/schema.ts

import { z } from "zod";

export const createWorkspaceUserSchema = z.object({
  name: z.string().min(1, "نام عضو الزامی است."),
  phone: z
    .string()
    .min(11, "شماره تلفن ۱۱ رقمی معتبر وارد کنید.")
    .max(11, "شماره تلفن معتبر نیست."),

  // ===== شروع اصلاحیه =====
  // به جای انتظار برای یک عدد، اکنون منتظر یک آبجکت هستیم که حداقل یک شناسه عددی داشته باشد
  role: z.object(
    { id: z.coerce.number() },
    { required_error: "انتخاب نقش الزامی است." }
  ),
  // ===== پایان اصلاحیه =====

  displayName: z.string().optional(),
  // برای برچسب‌ها و گروه‌ها نیز همین الگو را پیاده می‌کنیم
  labels: z.array(z.object({ id: z.number() })).optional(),
  userGroups: z.array(z.object({ id: z.number() })).optional(),
});

export const updateWorkspaceUserSchema = z.object({
  role: z.object(
    { id: z.coerce.number() },
    { required_error: "انتخاب نقش الزامی است." }
  ),
  displayName: z.string().optional(),
  labels: z.array(z.number()).optional(),
  userGroups: z.array(z.number()).optional(),
});
