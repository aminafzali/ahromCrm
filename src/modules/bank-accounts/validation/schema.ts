import { z } from "zod";

export const createBankAccountSchema = z.object({
  title: z.string().min(1, "نام حساب بانکی الزامی است"),
  bankName: z.string().optional().nullable(),
  iban: z.string().optional().nullable(),
  accountNumber: z.string().optional().nullable(),
  cardNumber: z.string().optional().nullable(),

  // کاربر (مخاطب) مالک حساب
  workspaceUser: z.object({ id: z.number() }).optional().nullable(),

  isDefaultForReceive: z.boolean().optional(),
  isDefaultForPay: z.boolean().optional(),
});

export const updateBankAccountSchema = createBankAccountSchema.partial();
