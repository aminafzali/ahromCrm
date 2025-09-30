// مسیر فایل: src/modules/teams/repo/TeamRepository.ts

import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { TeamWithRelations } from "../types";

export class TeamRepository extends BaseRepository<TeamWithRelations, number> {
  constructor() {
    super("teams");
  }
}