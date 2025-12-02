import { useCrud } from "@/@Client/hooks/useCrud";
import { z } from "zod";
import { BankAccountRepository } from "../repo/BankAccountRepository";
import { BankAccountWithRelations } from "../types";
import {
  createBankAccountSchema,
  updateBankAccountSchema,
} from "../validation/schema";

export function useBankAccount() {
  const repo = new BankAccountRepository();
  return useCrud<
    BankAccountWithRelations,
    z.infer<typeof createBankAccountSchema>,
    z.infer<typeof updateBankAccountSchema>
  >(repo);
}
