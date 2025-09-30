import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { CategoryWithRelations } from "../types";

export class CategoryRepository extends BaseRepository<CategoryWithRelations, number> {
  constructor() {
    super("categories");
  }
}