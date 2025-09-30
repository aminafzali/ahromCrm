import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { ProductServiceApi } from "../service/ProductServiceApi";

const service = new ProductServiceApi();

class ProductController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new ProductController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}