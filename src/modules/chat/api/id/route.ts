import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { ChatServiceApi } from "../../service/ChatServiceApi";

const service = new ChatServiceApi();
class Controller extends BaseController<any> {
  constructor() {
    super(service, {} as any);
  }
}
const controller = new Controller();

export async function GET(req: NextRequest, id: number) {
  return controller.getById(req, id);
}

export async function PATCH(req: NextRequest, id: number) {
  return controller.update(req, id);
}

export async function DELETE(req: NextRequest, id: number) {
  return controller.delete(req, id);
}
