import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";

export class SupportInfoRepository extends BaseRepository<any, number> {
  constructor() {
    super("support-info");
  }
}
