import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { ChequeServiceApi } from "../service/ChequeServiceApi";

const service = new ChequeServiceApi();

class ChequeController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new ChequeController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}

