// مسیر فایل: src/modules/teams/hooks/useTeam.ts

import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { TeamRepository } from "../repo/TeamRepository";
import { TeamWithRelations } from "../types";
import { createTeamSchema, updateTeamSchema } from "../validation/schema";

export function useTeam() {
  const repo = new TeamRepository();
  const hook = useCrud<
    TeamWithRelations,
    z.infer<typeof createTeamSchema>,
    z.infer<typeof updateTeamSchema>
  >(repo);

  return { ...hook };
}