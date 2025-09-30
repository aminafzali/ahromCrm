// مسیر فایل: src/modules/roles/hooks/useRole.ts

import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { RoleRepository } from "../repo/RoleRepository";
import { RoleWithRelations } from "../types";
import { createRoleSchema, updateRoleSchema } from "../validation/schema";

export function useRole() {
  const repo = new RoleRepository();
  const hook = useCrud<
    RoleWithRelations,
    z.infer<typeof createRoleSchema>,
    z.infer<typeof updateRoleSchema>
  >(repo);

  return {
    ...hook,
  };
}
