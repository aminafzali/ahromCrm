import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { SupportCategoryWithRelations } from "../types";

export class SupportCategoryRepository extends BaseRepository<
  SupportCategoryWithRelations,
  number
> {
  constructor() {
    super("supports-categories");
  }
}
