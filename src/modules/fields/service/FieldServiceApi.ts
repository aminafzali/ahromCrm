import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { searchFileds } from "../data/fetch";
import { createLabelSchema } from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("Field");
  }
}

export class FieldServiceApi extends BaseService<any> {
  constructor() {
    super(new Repository(), createLabelSchema, createLabelSchema, searchFileds);
    this.repository = new Repository();
  }
}