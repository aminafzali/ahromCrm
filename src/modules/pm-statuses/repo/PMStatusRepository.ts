// مسیر فایل: src/modules/pm-statuses/repo/PMStatusRepository.ts

import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { PMStatusWithRelations } from "../types";

export class PMStatusRepository extends BaseRepository<
  PMStatusWithRelations,
  number
> {
  constructor() {
    super("pm-statuses");
  }

  /**
   * درخواست به‌روزرسانی ترتیب وضعیت‌ها را به API ارسال می‌کند.
   * @param statuses آرایه‌ای از وضعیت‌ها شامل شناسه و ترتیب جدید.
   */
  public async reorder(
    statuses: { id: number; order: number }[]
  ): Promise<void> {
    // endpoint اختصاصی برای عملیات مرتب‌سازی، مطابق با الگوی شما
    const endpoint = `pm-statuses/reorder`;

    // ارسال درخواست POST با بدنه‌ی حاوی لیست وضعیت‌ها
    await this.post(endpoint, { statuses });
  }
}
