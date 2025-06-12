import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { connects, relations, searchFields } from "../data/fetch";
import { createProductSchema, updateProductSchema } from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("Product");
  }
}

export class ProductServiceApi extends BaseService<any> {
  constructor() {
    super(new Repository(), createProductSchema, updateProductSchema, searchFields, relations);
    this.repository = new Repository();
    this.connect = connects;
  }
}