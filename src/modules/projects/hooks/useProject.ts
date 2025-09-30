// مسیر فایل: src/modules/projects/hooks/useProject.ts

import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { ProjectRepository } from "../repo/ProjectRepository";
import { ProjectWithRelations } from "../types";
import { createProjectSchema, updateProjectSchema } from "../validation/schema";

export function useProject() {
  const repo = new ProjectRepository();
  const hook = useCrud<
    ProjectWithRelations,
    z.infer<typeof createProjectSchema>,
    z.infer<typeof updateProjectSchema>
  >(repo);

  return { ...hook };
}
