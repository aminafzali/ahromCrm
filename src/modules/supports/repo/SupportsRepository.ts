import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";

export class SupportsRepository extends BaseRepository<any, number> {
  constructor() {
    super("supports");
  }
}


