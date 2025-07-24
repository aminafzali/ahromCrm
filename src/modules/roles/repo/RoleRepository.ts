// مسیر فایل: src/modules/roles/repo/RoleRepository.ts

import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { RoleWithRelations } from "../types";

export class RoleRepository extends BaseRepository<RoleWithRelations, number> {
  constructor() {
    super("roles");
  }
}