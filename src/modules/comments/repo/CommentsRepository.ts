import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";

export class CommentsRepository extends BaseRepository<any, number> {
  constructor() {
    super("comments");
  }
}
