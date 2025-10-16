import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { SupportChatServiceApi } from "../service/SupportChatServiceApi";

const service = new SupportChatServiceApi();

class SupportChatController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new SupportChatController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}
