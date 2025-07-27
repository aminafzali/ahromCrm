// مسیر فایل: src/modules/workspace-users/api/route.ts

import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { WorkspaceUserServiceApi } from "../service/WorkspaceUserServiceApi";

const service = new WorkspaceUserServiceApi();

class WorkspaceUserController extends BaseController<any> {
  constructor() {
    super(service, include); // own = false
  }
}

const controller = new WorkspaceUserController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}
