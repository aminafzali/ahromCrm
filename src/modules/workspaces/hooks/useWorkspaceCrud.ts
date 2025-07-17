// مسیر فایل: src/modules/workspaces/hooks/useWorkspaceCrud.ts

import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { WorkspaceRepository } from "../repo/WorkspaceRepository";
import { WorkspaceWithDetails } from "../types";
import { workspaceSchema } from "../validation/schema";

export function useWorkspaceCrud() {
  const workspaceRepo = new WorkspaceRepository();

  const hook = useCrud<
    WorkspaceWithDetails,
    z.infer<typeof workspaceSchema>,
    z.infer<typeof workspaceSchema>
  >(workspaceRepo);

  return { ...hook };
}
