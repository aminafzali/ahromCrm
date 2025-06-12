import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { connect, relations, searchFileds } from "../data/fetch";
import { createCategorySchema } from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("Category");
  }
}

export class CategoryServiceApi extends BaseService<any> {
  constructor() {
    super(new Repository(), createCategorySchema, createCategorySchema, searchFileds, relations);
    this.connect = connect;
    this.repository = new Repository();
  }
}