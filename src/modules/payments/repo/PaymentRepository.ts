import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { PaymentWithRelations } from "../types";

export class PaymentRepository extends BaseRepository<PaymentWithRelations, number> {
  constructor() {
    super("payments");
  }
}