// مسیر فایل: src/modules/pm-statuses/validation/schema.ts

import { z } from "zod";

export const createPMStatusSchema = z.object({
  name: z.string().min(1, "نام وضعیت الزامی است."),
  color: z.string().min(1, "انتخاب رنگ الزامی است."),
  type: z.enum(["PROJECT", "TASK"], {
    required_error: "نوع وضعیت (پروژه/وظیفه) الزامی است.",
  }),
});

export const updatePMStatusSchema = z.object({
  name: z.string().min(1, "نام وضعیت الزامی است.").optional(),
  color: z.string().min(1, "انتخاب رنگ الزامی است.").optional(),
  type: z.enum(["PROJECT", "TASK"]).optional(),
});
