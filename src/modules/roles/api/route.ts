// مسیر فایل: src/modules/roles/api/route.ts

import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { RoleServiceApi } from "../service/RoleServiceApi";

const service = new RoleServiceApi();

class RoleController extends BaseController<any> {
  constructor() {
    // own را false می‌گذاریم چون نقش‌ها متعلق به کاربر خاصی نیستند
    super(service, include, false);
  }
}

const controller = new RoleController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}
