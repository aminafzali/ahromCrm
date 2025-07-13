// src/modules/reminders/api/route.ts

import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { ReminderApiService } from "../service/ReminderServiceApi";

const service = new ReminderApiService();

class ReminderController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new ReminderController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}
