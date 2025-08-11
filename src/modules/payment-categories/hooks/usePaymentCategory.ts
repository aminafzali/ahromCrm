// مسیر فایل: src/modules/payment-categories/hooks/usePaymentCategory.ts

import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { PaymentCategoryRepository } from "../repo/PaymentCategoryRepository";
import { PaymentCategoryWithRelations } from "../types";
import {
  createPaymentCategorySchema,
  updatePaymentCategorySchema,
} from "../validation/schema";

export function usePaymentCategory() {
  const repo = new PaymentCategoryRepository();
  return useCrud<
    PaymentCategoryWithRelations,
    z.infer<typeof createPaymentCategorySchema>,
    z.infer<typeof updatePaymentCategorySchema>
  >(repo);
}
