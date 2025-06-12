import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../../data/fetch";
import { PaymentServiceApi } from "../../service/PaymentServiceApi";

const service = new PaymentServiceApi();

class PaymentController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new PaymentController();

export async function GET(
  req: NextRequest,
  id: number
) {
  return controller.getById(req, id);
}

export async function PATCH(
  req: NextRequest,
  id: number
) {
  return controller.update(req, id);
}

export async function DELETE(
  req: NextRequest,
  id: number
) {
  return controller.delete(req, id);
}