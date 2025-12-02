import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { ChequeWithRelations } from "../types";

export class ChequeRepository extends BaseRepository<
  ChequeWithRelations,
  number
> {
  constructor() {
    super("cheques");
  }
}
