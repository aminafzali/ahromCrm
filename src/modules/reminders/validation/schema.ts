// src/modules/reminders/validation/schema.ts

import { z } from "zod";

// اسکیمای ساخت یادآور
export const createReminderSchema = z.object({
  title: z.string().min(3, { message: "عنوان باید حداقل ۳ کاراکتر باشد." }),
  description: z.string().max(1000).optional(),
  dueDate: z.coerce.date({
    required_error: "لطفاً تاریخ و زمان را انتخاب کنید.",
  }),
  userId: z.coerce.number({ required_error: "انتخاب کاربر الزامی است." }),
});

// اسکیمای ویرایش یادآور (مشابه ساخت، اما می‌توانست متفاوت باشد)
export const updateReminderSchema = createReminderSchema;
