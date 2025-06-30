// مسیر صحیح: src/modules/actual-services/api/id/route.ts

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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: number } }
) {
  return controller.getById(req, params.id);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: number } }
) {
  return controller.update(req, params.id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: number } }
) {
  return controller.delete(req, params.id);
}
