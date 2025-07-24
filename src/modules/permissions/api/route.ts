// مسیر فایل: src/modules/permissions/api/route.ts

import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { PermissionServiceApi } from "../service/PermissionServiceApi";

const service = new PermissionServiceApi();

class PermissionController extends BaseController<any> {
  constructor() {
    super(service, include, false);
  }
}

const controller = new PermissionController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}
