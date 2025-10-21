import { useCrud } from "@/@Client/hooks/useCrud";
import { ActivityCategoryRepository } from "../repo/ActivityCategoryRepository";
import { ActivityCategoryWithRelations } from "../types";

export function useActivityCategory() {
  const repo = new ActivityCategoryRepository();
  // No create/update here for now; reading is enough for selects/trees
  return useCrud<ActivityCategoryWithRelations, any, any>(repo);
}
