import { useCrud } from "@/@Client/hooks/useCrud";
import { CategoryRepository } from "../repo/CategoryRepository";
import { CategoryWithRelations } from "../types";
import { z } from "zod";
import { createCategorySchema } from "../validation/schema";

export function useCategory() {
  const categoryRepo = new CategoryRepository();
  const hook = useCrud<
    CategoryWithRelations,
    z.infer<typeof createCategorySchema>,
    z.infer<typeof createCategorySchema>,
    any
  >(categoryRepo);

  return {
    ...hook,
  };
}