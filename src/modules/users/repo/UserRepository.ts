import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { UserWithRelations } from "../types";

export class UserRepository extends BaseRepository<UserWithRelations, number> {
  constructor() {
    super("users");
  }
}
