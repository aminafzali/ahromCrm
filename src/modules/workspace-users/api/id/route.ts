// مسیر فایل: src/modules/workspace-users/api/id/route.ts

import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../../data/fetch";
import { WorkspaceUserServiceApi } from "../../service/WorkspaceUserServiceApi";

const service = new WorkspaceUserServiceApi();

class WorkspaceUserController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new WorkspaceUserController();

export async function GET(req: NextRequest, id: number) {
  return controller.getById(req, id);
}

export async function PATCH(req: NextRequest, id: number) {
  return controller.update(req, id);
}

export async function DELETE(req: NextRequest, id: number) {
  return controller.delete(req, id);
}
