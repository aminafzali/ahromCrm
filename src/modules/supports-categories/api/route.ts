import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { SupportCategoryServiceApi } from "../service/SupportCategoryServiceApi";

const service = new SupportCategoryServiceApi();
class Controller extends BaseController<any> {
  constructor() {
    super(service, include as any);
  }
}
const controller = new Controller();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}
