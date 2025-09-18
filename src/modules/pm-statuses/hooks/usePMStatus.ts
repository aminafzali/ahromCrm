// مسیر فایل: src/modules/pm-statuses/hooks/usePMStatus.ts

import { useCrud } from "@/@Client/hooks/useCrud";
import { toast } from "react-toastify";
import { z } from "zod";
import { PMStatusRepository } from "../repo/PMStatusRepository";
import { PMStatusWithRelations } from "../types";
import {
  createPMStatusSchema,
  updatePMStatusSchema,
} from "../validation/schema";

export function usePMStatus() {
  const repo = new PMStatusRepository();
  const hook = useCrud<
    PMStatusWithRelations,
    z.infer<typeof createPMStatusSchema>,
    z.infer<typeof updatePMStatusSchema>
  >(repo);

  const reorder = async (statuses: { id: number; order: number }[]) => {
    try {
      await repo.reorder(statuses);
      toast.success("ترتیب وضعیت‌ها با موفقیت ذخیره شد.");
    } catch (error) {
      toast.error("خطا در ذخیره ترتیب وضعیت‌ها.");
      console.error(error);
      throw error;
    }
  };

  return { ...hook, reorder };
}
