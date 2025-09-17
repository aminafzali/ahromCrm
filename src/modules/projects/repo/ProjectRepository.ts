// مسیر فایل: src/modules/projects/repo/ProjectRepository.ts

import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { ProjectWithRelations } from "../types";

export class ProjectRepository extends BaseRepository<
  ProjectWithRelations,
  number
> {
  constructor() {
    super("projects");
  }
}
