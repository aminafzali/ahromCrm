import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { ProductRepository } from "../repo/ProductRepository";
import { ProductWithRelations } from "../types";
import { createProductSchema, updateProductSchema } from "../validation/schema";

export function useProduct() {
  const productRepo = new ProductRepository();
  const hook = useCrud<
    ProductWithRelations,
    z.infer<typeof createProductSchema>,
    z.infer<typeof updateProductSchema>,
    any
  >(productRepo);

  return {
    ...hook,
  };
}