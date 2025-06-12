import { useCrud } from "@/@Client/hooks/useCrud";
import { BrandRepository } from "../repo/BrandRepository";
import { BrandWithRelations } from "../types";
import { z } from "zod";
import { createBrandSchema } from "../validation/schema";

export function useBrand() {
  const brandRepo = new BrandRepository();
  const hook = useCrud<
    BrandWithRelations,
    z.infer<typeof createBrandSchema>,
    z.infer<typeof createBrandSchema>,
    any
  >(brandRepo);

  return {
    ...hook,
  };
}