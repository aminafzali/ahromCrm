// src/modules/received-devices/service/ReceivedDeviceServiceApi.ts

import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { ReceivedDeviceWithRelations } from "../types";
import { createReceivedDeviceSchema, updateReceivedDeviceSchema } from "../validation/schema";
import { searchFileds, relations, connect } from "../data/fetch";

// تعریف ریپازیتوری به صورت محلی، دقیقا طبق الگو
class Repository extends BaseRepository<ReceivedDeviceWithRelations> {
  constructor() {
    super("receivedDevice");
  }
}

export class ReceivedDeviceServiceApi extends BaseService<ReceivedDeviceWithRelations> {
  constructor() {
    // آبجکت include از پارامترهای super حذف شده و به صورت مستقیم نیز ست نمی‌شود.
    super(
      new Repository(),
      createReceivedDeviceSchema,
      updateReceivedDeviceSchema,
      searchFileds,
      relations
    );
    
    this.connect = connect;
    this.repository = new Repository();
  }
}