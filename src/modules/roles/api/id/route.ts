// مسیر فایل: src/modules/roles/api/id/route.ts

import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../../data/fetch";
import { RoleServiceApi } from "../../service/RoleServiceApi";

const service = new RoleServiceApi();

class RoleController extends BaseController<any> {
  constructor() {
    super(service, include, false);
  }
}

const controller = new RoleController();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return controller.getById(req, params.id);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return controller.update(req, params.id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return controller.delete(req, params.id);
}
