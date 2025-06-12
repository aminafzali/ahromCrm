import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { FormWithRelations } from "../types";

export class FormRepository extends BaseRepository<FormWithRelations, number> {
  constructor() {
    super("forms");
  }
}