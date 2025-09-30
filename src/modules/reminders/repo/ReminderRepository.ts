// src/modules/reminders/repo/ReminderRepository.ts

import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { ReminderWithDetails } from "../types";

export class ReminderRepository extends BaseRepository<
  ReminderWithDetails,
  number
> {
  constructor() {
    super("reminders");
  }
}
