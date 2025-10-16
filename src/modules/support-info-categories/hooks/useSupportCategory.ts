import { useCrud } from "@/@Client/hooks/useCrud";
import { SupportInfoCategoryRepository } from "../repo/SupportCategoryRepository";
import { SupportInfoCategoryWithRelations } from "../types";

export function useSupportInfoCategory() {
  const repo = new SupportInfoCategoryRepository();
  // No create/update here for now; reading is enough for selects/trees
  return useCrud<SupportInfoCategoryWithRelations, any, any>(repo);
}
