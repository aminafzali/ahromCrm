import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { PaymentRepository } from "../repo/PaymentRepository";
import { PaymentWithRelations } from "../types";
import { createPaymentSchema } from "../validation/schema";

export function usePayment() {
  const paymentRepo = new PaymentRepository();
  const hook = useCrud<
    PaymentWithRelations,
    z.infer<typeof createPaymentSchema>,
    z.infer<typeof createPaymentSchema>
  >(paymentRepo);

  return {
    ...hook,
  };
}