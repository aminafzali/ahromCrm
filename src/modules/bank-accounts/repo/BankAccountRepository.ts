import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { BankAccountWithRelations } from "../types";

export class BankAccountRepository extends BaseRepository<
  BankAccountWithRelations,
  number
> {
  constructor() {
    super("bank-accounts");
  }
}


