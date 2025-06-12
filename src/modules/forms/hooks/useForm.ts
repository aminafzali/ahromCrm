import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { FormRepository } from "../repo/FormRepository";
import { FormWithRelations } from "../types";
import { createFormSchema, updateFormSchema } from "../validation/schema";

export function useForm() {
  const repo = new FormRepository();
  const hook = useCrud<
    FormWithRelations,
    z.infer<typeof createFormSchema>,
    z.infer<typeof updateFormSchema>
  >(repo);

  return {
    ...hook
  };
}