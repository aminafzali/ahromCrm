// مسیر فایل: src/modules/actual-services/hooks/useActualService.ts

import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { ActualServiceRepository } from "../repo/ActualServiceRepository";
import { ActualServiceWithRelations } from "../types";
import { createActualServiceSchema } from "../validation/schema";

export function useActualService() {
  const actualServiceRepo = new ActualServiceRepository();
  const hook = useCrud<
    ActualServiceWithRelations,
    z.infer<typeof createActualServiceSchema>,
    z.infer<typeof createActualServiceSchema>,
    any
  >(actualServiceRepo);

  return {
    ...hook,
  };
}
