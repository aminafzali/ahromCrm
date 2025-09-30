import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { LabelWithRelations } from "../types";

export class LabelRepository extends BaseRepository<LabelWithRelations, number> {
  constructor() {
    super("labels");
  }
}