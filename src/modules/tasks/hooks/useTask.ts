// مسیر فایل: src/modules/tasks/hooks/useTask.ts

import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { TaskRepository } from "../repo/TaskRepository";
import { TaskWithRelations } from "../types";
import { createTaskSchema, updateTaskSchema } from "../validation/schema";

export function useTask() {
  const repo = new TaskRepository();
  const hook = useCrud<
    TaskWithRelations,
    z.infer<typeof createTaskSchema>,
    z.infer<typeof updateTaskSchema>
  >(repo);

  return { ...hook };
}
