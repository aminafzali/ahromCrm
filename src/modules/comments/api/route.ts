import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { CommentServiceApi } from "../service/CommentServiceApi";

const service = new CommentServiceApi();
class Controller extends BaseController<any> {
  constructor() {
    super(service, {} as any);
  }
}
const controller = new Controller();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}


