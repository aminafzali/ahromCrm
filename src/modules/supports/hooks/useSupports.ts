import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { SupportsRepository } from "../repo/SupportsRepository";
import {
  createSupportsSchema,
  updateSupportsSchema,
} from "../validation/schema";

export function useSupports() {
  const repo = new SupportsRepository();
  const hook = useCrud<
    any,
    z.infer<typeof createSupportsSchema>,
    z.infer<typeof updateSupportsSchema>
  >(repo);
  return { ...hook };
}
