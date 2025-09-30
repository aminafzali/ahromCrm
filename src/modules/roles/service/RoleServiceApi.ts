// مسیر فایل: src/modules/roles/service/RoleServiceApi.ts

import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { relations, searchFileds } from "../data/fetch";
import { createRoleSchema, updateRoleSchema } from "../validation/schema";

// ریپازیتوری سرور به صورت یک کلاس داخلی تعریف می‌شود، دقیقاً مانند ماژول brands
class Repository extends BaseRepository<any> {
  constructor() {
    super("role"); // نام مدل در پریزما
  }
}

export class RoleServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      createRoleSchema,
      updateRoleSchema, // از اسکیمای آپدیت استفاده می‌کنیم
      searchFileds,
      relations
    );
    this.repository = new Repository();
  }
}
