import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";

export class ActivityRepository extends BaseRepository<any, number> {
  constructor() {
    super("activities");
  }
}
