// مسیر فایل: src/modules/payment-categories/api/route.ts

import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { PaymentCategoryServiceApi } from "../service/PaymentCategoryServiceApi";

const service = new PaymentCategoryServiceApi();

class PaymentCategoryController extends BaseController<any> {
  constructor() {
    super(service, include, false);
  }
}

const controller = new PaymentCategoryController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}
