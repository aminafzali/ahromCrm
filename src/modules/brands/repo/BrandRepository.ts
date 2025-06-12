import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { BrandWithRelations } from "../types";

export class BrandRepository extends BaseRepository<BrandWithRelations, number> {
  constructor() {
    super("brands");
  }
}