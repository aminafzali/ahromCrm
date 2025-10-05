// src/modules/reminders/repo/ReminderRepository.ts

import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { ReminderWithDetails } from "../types";

export class ReminderRepository extends BaseRepository<
  ReminderWithDetails,
  number
> {
  constructor() {
    super("reminders");
  }

  /**
   * شماره یادآور بعدی را بر اساس کسب‌وکار از سرور دریافت می‌کند.
   * @param workspaceId شناسه کسب‌وکار
   */
  public async getNextReminderNumber(
    workspaceId: number
  ): Promise<{ reminderNumber: number; reminderNumberName: string }> {
    // پارامترها به صورت کوئری به API ارسال می‌شوند
    const endpoint = `reminders/next-number?workspaceId=${workspaceId}`;

    const result = await this.get<{
      reminderNumber: number;
      reminderNumberName: string;
    }>(endpoint);

    return result;
  }

  /**
   * یادآورهای گروه‌بندی شده را دریافت می‌کند
   */
  public async getGroupedReminders(params: any): Promise<any> {
    const endpoint = `reminders/grouped`;
    const result = await this.get<any>(endpoint, params);
    return result;
  }
}
