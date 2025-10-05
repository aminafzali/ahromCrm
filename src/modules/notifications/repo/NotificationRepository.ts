import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { NotificationWithRelations } from "../types";

export class NotificationRepository extends BaseRepository<
  NotificationWithRelations,
  number
> {
  constructor() {
    super("notifications");
  }

  /**
   * شماره اعلان بعدی را بر اساس کسب‌وکار از سرور دریافت می‌کند.
   * @param workspaceId شناسه کسب‌وکار
   */
  public async getNextNotificationNumber(
    workspaceId: number
  ): Promise<{ notificationNumber: number; notificationNumberName: string }> {
    // پارامترها به صورت کوئری به API ارسال می‌شوند
    const endpoint = `notifications/next-number?workspaceId=${workspaceId}`;

    const result = await this.get<{
      notificationNumber: number;
      notificationNumberName: string;
    }>(endpoint);

    return result;
  }
}
