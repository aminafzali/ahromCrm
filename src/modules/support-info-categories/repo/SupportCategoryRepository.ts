import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { SupportInfoCategoryWithRelations } from "../types";

export class SupportInfoCategoryRepository extends BaseRepository<
  SupportInfoCategoryWithRelations,
  number
> {
  constructor() {
    super("support-info-categories");
  }
}
