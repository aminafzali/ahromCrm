// مسیر فایل: src/modules/pm-statuses/validation/schema.ts

import { z } from "zod";

export const createPMStatusSchema = z.object({
  name: z.string().min(1, "نام وضعیت الزامی است."),
  color: z.string().min(1, "انتخاب رنگ الزامی است."),
  type: z.enum(["PROJECT", "TASK"], {
    required_error: "نوع وضعیت (پروژه/وظیفه) الزامی است.",
  }),
  // projectId اختیاری: اگر null باشد = وضعیت کلی، اگر مشخص باشد = وضعیت خاص آن پروژه
  projectId: z.number().optional().nullable(),
  project: z.object({ id: z.number() }).optional(),
});

export const updatePMStatusSchema = z.object({
  name: z.string().min(1, "نام وضعیت الزامی است.").optional(),
  color: z.string().min(1, "انتخاب رنگ الزامی است.").optional(),
  type: z.enum(["PROJECT", "TASK"]).optional(),
  projectId: z.number().optional().nullable(),
  project: z.object({ id: z.number() }).optional(),
});
