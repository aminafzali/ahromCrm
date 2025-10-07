import { useCrud } from "@/@Client/hooks/useCrud";
import { SupportCategoryRepository } from "../repo/SupportCategoryRepository";
import { SupportCategoryWithRelations } from "../types";

export function useSupportCategory() {
  const repo = new SupportCategoryRepository();
  // No create/update here for now; reading is enough for selects/trees
  return useCrud<SupportCategoryWithRelations, any, any>(repo);
}
