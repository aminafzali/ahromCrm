// مسیر فایل: src/modules/actual-services/repo/ActualServiceRepository.ts

import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { ActualServiceWithRelations } from "../types";

export class ActualServiceRepository extends BaseRepository<
  ActualServiceWithRelations,
  number
> {
  constructor() {
    super("actual-services");
  }
}
