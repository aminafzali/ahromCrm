// مسیر فایل: src/@Client/repo/WorkspaceRepository.ts
import { BaseRepository } from "../Http/Repository/BaseRepository";
export class WorkspaceRepository extends BaseRepository<any, number, any, any> {
  constructor() {
    super("workspaces");
  }
}
