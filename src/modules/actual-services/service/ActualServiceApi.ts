// مسیر فایل: src/modules/actual-services/service/ActualServiceApi.ts

import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { connects, relations, searchFileds } from "../data/fetch";
import {
  createActualServiceSchema,
  updateActualServiceSchema,
} from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    // دقیقا طبق الگو، نام مدل به صورت رشته پاس داده می‌شود
    super("actualService");
  }
}

export class ActualServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      createActualServiceSchema,
      updateActualServiceSchema,
      searchFileds,
      relations
    );
    this.connect = connects;
    this.repository = new Repository();
  }
}
