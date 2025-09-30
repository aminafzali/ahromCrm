import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { Status } from "../types";

export class StatusRepository extends BaseRepository<Status, number> {
  constructor() {
    super("statuses");
  }
}