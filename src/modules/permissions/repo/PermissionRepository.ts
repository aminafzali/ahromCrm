// مسیر فایل: src/modules/permissions/repo/PermissionRepository.ts

import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { PermissionWithRelations } from "../types";

export class PermissionRepository extends BaseRepository<
  PermissionWithRelations,
  number
> {
  constructor() {
    super("permissions");
  }
}
