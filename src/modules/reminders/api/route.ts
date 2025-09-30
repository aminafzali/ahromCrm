// مسیر فایل: src/modules/reminders/api/route.ts
import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { ReminderService } from "../../../@Server/Http/Service/ReminderService";
import { include } from "../data/fetch";

const service = new ReminderService();
class ReminderController extends BaseController<any> {
  constructor() {
    super(service, include, true);
  }
}
const controller = new ReminderController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}
export async function POST(req: NextRequest) {
  return controller.create(req);
}
