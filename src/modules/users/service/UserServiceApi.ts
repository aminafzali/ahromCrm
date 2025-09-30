// مسیر فایل: src/modules/users/service/UserServiceApi.ts (نسخه نهایی و کامل)

import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { connects, relations, searchFileds } from "../data/fetch";
import { createUserSchema } from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("User");
  }
}

export class UserServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      createUserSchema,
      createUserSchema, // برای آپدیت نیز از همین اسکیما استفاده می‌کنیم
      searchFileds,
      relations // ++ اصلاحیه کلیدی: حذف مقداردهی پیش‌فرض برای فیلد حذف شده role ++
      // { role: "USER" }  <-- این خط حذف می‌شود
    );
    this.connect = connects;
  }
}
