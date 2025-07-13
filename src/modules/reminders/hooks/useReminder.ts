// src/modules/reminders/hooks/useReminder.ts

import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { ReminderRepository } from "../repo/ReminderRepository";
import { ReminderWithDetails } from "../types";
// ** اصلاحیه: ایمپورت نام صحیح اسکیمای ویرایش **
import {
  createReminderSchema,
  updateReminderSchema,
} from "../validation/schema";

export function useReminder() {
  const reminderRepo = new ReminderRepository();

  const hook = useCrud<
    ReminderWithDetails,
    z.infer<typeof createReminderSchema>,
    z.infer<typeof updateReminderSchema>, // ** اصلاحیه: استفاده از نام صحیح **
    any
  >(reminderRepo);

  return { ...hook };
}
