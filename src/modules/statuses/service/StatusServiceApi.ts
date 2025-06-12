import { BaseService } from "@/@Server/Http/Service/BaseService";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { createStatusSchema } from "../validation/schema";
import { searchFileds, relations } from "../data/fetch";

class Repository extends BaseRepository<any> {
  constructor() {
    super("Status");
  }
}

export class StatusServiceApi extends BaseService<any> {
  constructor() {
    super(new Repository(), createStatusSchema, createStatusSchema, searchFileds, relations);
    this.repository = new Repository();
  }
}