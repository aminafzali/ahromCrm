import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { RequestWithRelations } from "../types";

export class RequestRepository extends BaseRepository<RequestWithRelations, number> {
  constructor() {
    super("requests");
  }
}