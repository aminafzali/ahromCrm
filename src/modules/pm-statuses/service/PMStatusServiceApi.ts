// مسیر فایل: src/modules/pm-statuses/service/PMStatusServiceApi.ts

import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { relations, searchFileds } from "../data/fetch";
import {
  createPMStatusSchema,
  updatePMStatusSchema,
} from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("pMStatus");
  }
}

export class PMStatusServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      createPMStatusSchema,
      updatePMStatusSchema,
      searchFileds,
      relations
    );
  }
}
