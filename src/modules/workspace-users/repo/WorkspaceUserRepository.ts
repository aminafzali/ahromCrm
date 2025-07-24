// مسیر فایل: src/modules/workspace-users/repo/WorkspaceUserRepository.ts

import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { WorkspaceUserWithRelations } from "../types";

export class WorkspaceUserRepository extends BaseRepository<
  WorkspaceUserWithRelations,
  number
> {
  constructor() {
    super("workspace-users");
  }
}