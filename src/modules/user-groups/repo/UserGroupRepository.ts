import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { UserGroupWithRelations } from "../types";

export class UserGroupRepository extends BaseRepository<UserGroupWithRelations, number> {
  constructor() {
    super("user-groups");
  }
}