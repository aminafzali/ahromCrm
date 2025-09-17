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
}
