// مسیر فایل: src/modules/workspace-users/hooks/useWorkspaceUser.ts

import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { WorkspaceUserRepository } from "../repo/WorkspaceUserRepository";
import { WorkspaceUserWithRelations } from "../types";
import {
  createWorkspaceUserSchema,
  updateWorkspaceUserSchema,
} from "../validation/schema";

export function useWorkspaceUser() {
  const repo = new WorkspaceUserRepository();
  const hook = useCrud<
    WorkspaceUserWithRelations,
    z.infer<typeof createWorkspaceUserSchema>,
    z.infer<typeof updateWorkspaceUserSchema>
  >(repo);

  return {
    ...hook,
  };
}
