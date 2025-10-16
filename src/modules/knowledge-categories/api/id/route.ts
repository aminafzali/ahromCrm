import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../../data/fetch";
import { KnowledgeCategoryServiceApi } from "../../service/KnowledgeCategoryServiceApi";

const service = new KnowledgeCategoryServiceApi();
class Controller extends BaseController<any> {
  constructor() {
    super(service, include as any);
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


