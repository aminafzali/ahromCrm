// src/modules/reminders/api/id/route.ts

import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../../data/fetch";
import { ReminderApiService } from "../../service/ReminderServiceApi";

const service = new ReminderApiService();

class ReminderController extends BaseController<any> {
  constructor() {
    super(service, include, true);
  }
}

const controller = new ReminderController();

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const numericId = parseInt(params.id, 10);
  return controller.delete(req, numericId);
}
