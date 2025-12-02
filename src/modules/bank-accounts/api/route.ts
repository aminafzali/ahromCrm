import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { BankAccountServiceApi } from "../service/BankAccountServiceApi";

const service = new BankAccountServiceApi();

class BankAccountController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new BankAccountController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}
