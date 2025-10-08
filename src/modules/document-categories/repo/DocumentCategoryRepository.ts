import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";

export class DocumentCategoryRepository extends BaseRepository<any, number> {
  constructor() {
    super("document-categories");
  }
}
