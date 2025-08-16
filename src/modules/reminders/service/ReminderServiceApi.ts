// مسیر فایل: src/modules/reminders/service/ReminderApiService.ts

import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { Reminder } from "@prisma/client";
import { searchFileds } from "../data/fetch";
import { createReminderSchema } from "../validation/schema";

class Repository extends BaseRepository<Reminder> {
  constructor() {
    super("Reminder");
  }
}

export class ReminderApiService extends BaseService<Reminder> {
  constructor() {
    super(
      new Repository(),
      createReminderSchema,
      createReminderSchema.partial(),
      searchFileds,
      ["workspaceUser"]
    );
  }
}
