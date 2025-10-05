// مسیر فایل: src/modules/reminders/api/id/route.ts
import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../../data/fetch";
import { ReminderServiceApi } from "../../service/ReminderServiceApi";

const service = new ReminderServiceApi();
class ReminderController extends BaseController<any> {
  constructor() {
    super(service, include, true);
  }
}
const controller = new ReminderController();

export async function GET(req: NextRequest, id: number) {
  return controller.getById(req, id);
}

export async function PATCH(req: NextRequest, id: number) {
  return controller.update(req, id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return controller.delete(req, parseInt(params.id, 10));
}
