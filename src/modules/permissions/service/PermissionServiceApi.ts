// مسیر فایل: src/modules/permissions/service/PermissionServiceApi.ts

import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { relations, searchFileds } from "../data/fetch";
import {
  createPermissionSchema,
  updatePermissionSchema,
} from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("permission");
  }
}

export class PermissionServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      createPermissionSchema,
      updatePermissionSchema,
      searchFileds,
      relations
    );
    this.repository = new Repository();
  }
}
