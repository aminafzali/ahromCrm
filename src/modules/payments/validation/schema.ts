import { z } from "zod";

export const createPaymentSchema = z.object({
  workspaceUser: z.any(),
  invoiceId: z.any().optional(),
  amount: z.number().min(1000, "مبلغ باید حداقل 1000 تومان باشد"),
  method: z.string(),
  type: z.string(),
  reference: z.string().optional(),
  description: z.string().optional(),
  status: z.string(),
  paymentCategoryId: z.any(),
});

export const updatePaymentStatusSchema = z.object({
  status: z.enum(["PENDING", "SUCCESS", "FAILED"]),
  note: z.string().optional(),
});
