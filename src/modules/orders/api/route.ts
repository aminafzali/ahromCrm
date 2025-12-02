import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { OrderServiceApi } from "../service/OrderServiceApi";

const service = new OrderServiceApi();

class OrderController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new OrderController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}

