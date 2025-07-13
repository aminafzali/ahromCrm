// src/modules/reminders/service/ReminderApiService.ts

import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import { Reminder } from "@prisma/client";
import { relations, searchFileds } from "../data/fetch";
import {
  createReminderSchema,
  updateReminderSchema,
} from "../validation/schema";

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
      updateReminderSchema, // ++ اسکیمای آپدیت اضافه شد ++
      searchFileds,
      relations
    );
  }
}
