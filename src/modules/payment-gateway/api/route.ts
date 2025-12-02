import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { PaymentGatewayServiceApi } from "../service/PaymentGatewayServiceApi";

const service = new PaymentGatewayServiceApi();

class PaymentGatewayController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new PaymentGatewayController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}
