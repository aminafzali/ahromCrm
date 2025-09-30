// مسیر فایل: src/modules/projects/api/route.ts

import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { ProjectServiceApi } from "../service/ProjectServiceApi";

const service = new ProjectServiceApi();
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
