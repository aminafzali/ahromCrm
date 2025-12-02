import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import {
  WarehouseCreateInput,
  WarehouseUpdateInput,
  WarehouseWithRelations,
} from "../types";

export class WarehouseRepository extends BaseRepository<
  WarehouseWithRelations,
  number,
  WarehouseCreateInput,
  WarehouseUpdateInput
> {
  constructor() {
    super("warehouses");
  }
}
