import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { ProductWithRelations } from "../types";

export class ProductRepository extends BaseRepository<ProductWithRelations, number> {
  constructor() {
    super("products");
  }
}