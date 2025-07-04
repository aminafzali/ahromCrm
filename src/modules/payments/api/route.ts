import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { PaymentServiceApi } from "../service/PaymentServiceApi";

const service = new PaymentServiceApi();

class PaymentController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new PaymentController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}