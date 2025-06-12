import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { NotificationServiceApi } from "../service/NotificationServiceApi";

const service = new NotificationServiceApi();

class NotificationController extends BaseController<any> {
  constructor() {
    super(service, include , true);
  }
}

const controller = new NotificationController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}