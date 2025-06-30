// مسیر صحیح: src/modules/actual-services/api/route.ts

import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { include } from "@/modules/actual-services/data/fetch";
import { ActualServiceApi } from "@/modules/actual-services/service/ActualServiceApi";
import { NextRequest } from "next/server";

const service = new ActualServiceApi();

class ActualServiceController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new ActualServiceController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}
