import { BaseService } from "@/@Server/Http/Service/BaseService";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { createServiceTypeSchema } from "../validation/schema";
import { searchFileds, relations } from "../data/fetch";

class Repository extends BaseRepository<any> {
  constructor() {
    super("ServiceType");
  }
}

export class ServiceTypeServiceApi extends BaseService<any> {
  constructor() {
    super(new Repository(), createServiceTypeSchema, createServiceTypeSchema, searchFileds, relations);
    this.repository = new Repository();
  }
}