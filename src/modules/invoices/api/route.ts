import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { InvoiceServiceApi } from "../service/InvoiceServiceApi";

const service = new InvoiceServiceApi();

class InvoiceController extends BaseController<any> {
  constructor() {
    super(service , include ,true);
  }
}

const controller = new InvoiceController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}
