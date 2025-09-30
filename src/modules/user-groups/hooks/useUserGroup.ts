import { useCrud } from "@/@Client/hooks/useCrud";
import { UserGroupRepository } from "../repo/UserGroupRepository";
import { UserGroupWithRelations } from "../types";
import { z } from "zod";
import { createUserGroupSchema } from "../validation/schema";

export function useUserGroup() {
  const userGroupRepo = new UserGroupRepository();
  const hook = useCrud<
    UserGroupWithRelations,
    z.infer<typeof createUserGroupSchema>,
    z.infer<typeof createUserGroupSchema>,
    any
  >(userGroupRepo);

  return {
    ...hook,
  };
}