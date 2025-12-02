import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { ShippingServiceApi } from "../service/ShippingServiceApi";

const service = new ShippingServiceApi();

class ShippingController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new ShippingController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}
