import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { DocumentCategoryServiceApi } from "../service/DocumentCategoryServiceApi";

const service = new DocumentCategoryServiceApi();
class Controller extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}
const controller = new Controller();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}
