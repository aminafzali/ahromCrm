// src/modules/received-devices/api/id/route.ts

import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../../data/fetch";
import { ReceivedDeviceServiceApi } from "../../service/ReceivedDeviceServiceApi";

const service = new ReceivedDeviceServiceApi();
class ReceivedDeviceController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}
const controller = new ReceivedDeviceController();

export async function GET(req: NextRequest, id: number) {
  return controller.getById(req, id);
}
export async function PATCH(req: NextRequest, id: number) {
  return controller.update(req, id);
}
export async function DELETE(req: NextRequest, id: number) {
  return controller.delete(req, id);
}
