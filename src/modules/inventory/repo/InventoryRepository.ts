import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { StockMovementWithRelations } from "../types";

export class InventoryRepository extends BaseRepository<
  StockMovementWithRelations,
  number
> {
  constructor() {
    super("inventory");
  }
}

