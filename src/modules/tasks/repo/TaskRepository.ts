// مسیر فایل: src/modules/tasks/repo/TaskRepository.ts

import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { TaskWithRelations } from "../types";

export class TaskRepository extends BaseRepository<TaskWithRelations, number> {
  constructor() {
    super("tasks");
  }
}
