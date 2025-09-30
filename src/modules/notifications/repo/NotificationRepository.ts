import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { NotificationWithRelations } from "../types";

export class NotificationRepository extends BaseRepository<NotificationWithRelations, number> {
  constructor() {
    super("notifications");
  }
}