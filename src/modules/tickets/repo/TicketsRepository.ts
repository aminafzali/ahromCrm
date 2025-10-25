import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";

export class TicketsRepository extends BaseRepository<any, number> {
  constructor() {
    super("tickets");
  }
}
