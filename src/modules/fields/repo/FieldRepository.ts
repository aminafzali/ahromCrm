import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { FieldWithRelations } from "../types";

export class FieldRepository extends BaseRepository<FieldWithRelations, number> {
  constructor() {
    super("fields");
  }
}