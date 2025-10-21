import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { ActivityCategoryWithRelations } from "../types";

export class ActivityCategoryRepository extends BaseRepository<
  ActivityCategoryWithRelations,
  number
> {
  constructor() {
    super("activity-categories");
  }
}
