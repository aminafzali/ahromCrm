import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { ChequeRepository } from "../repo/ChequeRepository";
import { ChequeWithRelations } from "../types";
import { createChequeSchema } from "../validation/schema";

export function useCheque() {
  const chequeRepo = new ChequeRepository();
  const hook = useCrud<
    ChequeWithRelations,
    z.infer<typeof createChequeSchema>,
    z.infer<typeof createChequeSchema>
  >(chequeRepo);

  return {
    ...hook,
  };
}
