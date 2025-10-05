// مسیر فایل: src/modules/reminders/hooks/useReminder.ts

import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { ReminderRepository } from "../repo/ReminderRepository";
import { ReminderWithDetails } from "../types";
// ** اصلاحیه: ایمپورت نام‌های صحیح اسکیمای ساخت و ویرایش **
import { createReminderSchema } from "../validation/schema";

export function useReminder() {
  const { activeWorkspace } = useWorkspace();
  const reminderRepo = new ReminderRepository();

  const hook = useCrud<
    ReminderWithDetails,
    z.infer<typeof createReminderSchema>,
    z.infer<typeof createReminderSchema>, // برای آپدیت هم از همین اسکیما استفاده می‌کنیم
    any
  >(reminderRepo);

  const fetchNextReminderNumber = async () => {
    try {
      if (!activeWorkspace?.id) {
        throw new Error("Workspace ID is not available.");
      }
      // workspaceId را به صورت دستی به تابع پاس می‌دهیم
      const data = await reminderRepo.getNextReminderNumber(activeWorkspace.id);
      return data;
    } catch (error) {
      console.error("Failed to fetch next reminder number", error);
      return { reminderNumber: 1, reminderNumberName: "RE-2025100001" };
    }
  };

  const getGroupedReminders = async (params: any) => {
    try {
      if (!activeWorkspace?.id) {
        throw new Error("Workspace ID is not available.");
      }
      const data = await reminderRepo.getGroupedReminders({
        ...params,
        workspaceId: activeWorkspace.id,
      });
      return data;
    } catch (error) {
      console.error("Failed to fetch grouped reminders", error);
      throw error;
    }
  };

  return {
    ...hook,
    fetchNextReminderNumber,
    getGroupedReminders,
  };
}
