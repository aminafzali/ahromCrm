
import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { UserRepository } from "../repo/UserRepository";
import { UserWithRelations } from "../types";
import {
  createUserSchema,
  updateUserStatusSchema,
} from "../validation/schema";

export function useUser() {
  const repo = new UserRepository();
  const hook = useCrud<
    UserWithRelations,
    z.infer<typeof createUserSchema>,
    z.infer<typeof createUserSchema>,
    z.infer<typeof updateUserStatusSchema>
  >(repo);


  return {
    ...hook
  };
}
