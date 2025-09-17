// مسیر فایل: src/modules/pm-statuses/hooks/usePMStatus.ts

import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { PMStatusRepository } from "../repo/PMStatusRepository";
import { PMStatusWithRelations } from "../types";
import {
  createPMStatusSchema,
  updatePMStatusSchema,
} from "../validation/schema";

export function usePMStatus() {
  const repo = new PMStatusRepository();
  const hook = useCrud<
    PMStatusWithRelations,
    z.infer<typeof createPMStatusSchema>,
    z.infer<typeof updatePMStatusSchema>
  >(repo);

  return { ...hook };
}
