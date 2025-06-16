// src/modules/received-devices/api/route.ts

import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { ReceivedDeviceServiceApi } from "../service/ReceivedDeviceServiceApi";

const service = new ReceivedDeviceServiceApi();
class ReceivedDeviceController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}
const controller = new ReceivedDeviceController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}
export async function POST(req: NextRequest) {
  return controller.create(req);
}