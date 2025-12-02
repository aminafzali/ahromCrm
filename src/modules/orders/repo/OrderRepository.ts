import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { OrderWithRelations } from "../types";

export class OrderRepository extends BaseRepository<OrderWithRelations, number> {
  constructor() {
    super("orders");
  }
}

