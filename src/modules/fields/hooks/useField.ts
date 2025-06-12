import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { FieldRepository } from "../repo/FieldRepository";
import { FieldWithRelations } from "../types";
import { createLabelSchema } from "../validation/schema";

export function useField() {
  const labelRepo = new FieldRepository();
  const hook = useCrud<
    FieldWithRelations,
    z.infer<typeof createLabelSchema>,
    z.infer<typeof createLabelSchema>,
    any
  >(labelRepo);

  return {
    ...hook,
  };
}