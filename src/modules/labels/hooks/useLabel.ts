import { useCrud } from "@/@Client/hooks/useCrud";
import { LabelRepository } from "../repo/LabelRepository";
import { LabelWithRelations } from "../types";
import { z } from "zod";
import { createLabelSchema } from "../validation/schema";

export function useLabel() {
  const labelRepo = new LabelRepository();
  const hook = useCrud<
    LabelWithRelations,
    z.infer<typeof createLabelSchema>,
    z.infer<typeof createLabelSchema>,
    any
  >(labelRepo);

  return {
    ...hook,
  };
}