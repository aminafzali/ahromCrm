import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { RequestServiceApi } from "../service/RequestServiceApi";

const service = new RequestServiceApi();

class RequestController extends BaseController<any> {
  constructor() {
    super(service, include , true);
  }
}

const controller = new RequestController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}