import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { PaymentCategoryWithRelations } from "../types";

export class PaymentCategoryRepository extends BaseRepository<
  PaymentCategoryWithRelations,
  number
> {
  constructor() {
    super("payment-categories");
  }
}
