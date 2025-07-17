// مسیر فایل: src/modules/workspaces/repo/WorkspaceRepository.ts (نسخه نهایی و کامل)

import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { WorkspaceWithDetails } from "../types";

/**
 * این ریپازیتوری کلاینت، یک wrapper ساده برای BaseRepository است
 * و فقط slug مربوط به API ورک‌اسپیس‌ها ("workspaces") را مشخص می‌کند.
 */
export class WorkspaceRepository extends BaseRepository<
  WorkspaceWithDetails,
  number
> {
  constructor() {
    super("workspaces");
  }
}