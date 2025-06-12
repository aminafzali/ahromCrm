import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { relations, searchFileds } from "../data/fetch";
import { createBrandSchema } from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("Brand");
  }
}

export class BrandServiceApi extends BaseService<any> {
  constructor() {
    super(new Repository(), createBrandSchema, createBrandSchema, searchFileds, relations);
    this.repository = new Repository();
  }
}