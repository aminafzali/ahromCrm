// مسیر فایل: src/modules/tasks/api/id/route.ts

import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../../data/fetch";
import { TaskServiceApi } from "../../service/TaskServiceApi";

const service = new TaskServiceApi();
class Controller extends BaseController<any> {
  constructor() {
    super(service, include);
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
