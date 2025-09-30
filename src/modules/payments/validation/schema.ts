import { z } from "zod";

export const createPaymentSchema = z.object({
  workspaceUser: z.object(
    { id: z.number() },
    { required_error: "انتخاب کاربر الزامی است." }
  ),
  invoiceId: z.any().optional(),
  amount: z.number().min(1000, "مبلغ باید حداقل 1000 تومان باشد"),
  method: z.string(),
  type: z.string(),
  reference: z.string().optional(),
  description: z.string().optional(),
  status: z.string(),
  paymentCategoryId: z.any(),
  paidAt: z.string().optional(),
});

export const updatePaymentStatusSchema = z.object({
  status: z.enum(["PENDING", "SUCCESS", "FAILED"]),
  note: z.string().optional(),
});
