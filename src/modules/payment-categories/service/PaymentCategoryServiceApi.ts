import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { connects, relations, searchFileds } from "../data/fetch";
import {
  createPaymentCategorySchema,
  updatePaymentCategorySchema,
} from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("paymentCategory");
  }
}

export class PaymentCategoryServiceApi extends BaseService<any> {
  constructor() {
    super(
      new Repository(),
      createPaymentCategorySchema,
      updatePaymentCategorySchema,
      searchFileds,
      relations
    );
    this.connect = connects;
    this.repository = new Repository();
  }
}
