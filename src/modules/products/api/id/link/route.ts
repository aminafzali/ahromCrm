import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { include } from "@/modules/products/data/fetch";
import { ProductServiceApi } from "@/modules/products/service/ProductServiceApi";
import { NextRequest } from "next/server";

const service = new ProductServiceApi();

class ProductController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new ProductController();


export async function POST(req: NextRequest, id: number) {
  return controller.link(req, id);
}

export async function PATCH(req: NextRequest, id: number) {
  return controller.unlink(req, id);
}