// مسیر فایل: src/modules/reminders/hooks/useReminder.ts

import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { ReminderRepository } from "../repo/ReminderRepository";
import { ReminderWithDetails } from "../types";
// ** اصلاحیه: ایمپورت نام‌های صحیح اسکیمای ساخت و ویرایش **
import { createReminderSchema } from "../validation/schema";

export function useReminder() {
  const reminderRepo = new ReminderRepository();

  const hook = useCrud<
    ReminderWithDetails,
    z.infer<typeof createReminderSchema>,
    z.infer<typeof createReminderSchema>, // برای آپدیت هم از همین اسکیما استفاده می‌کنیم
    any
  >(reminderRepo);

  return { ...hook };
}
