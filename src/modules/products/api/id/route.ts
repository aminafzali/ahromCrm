import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../../data/fetch";
import { ProductServiceApi } from "../../service/ProductServiceApi";

const service = new ProductServiceApi();

class ProductController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new ProductController();

export async function GET(req: NextRequest, id: number) {
  return controller.getById(req, id);
}

export async function PATCH(req: NextRequest, id: number) {
  return controller.update(req, id);
}

export async function PUT(req: NextRequest, id: number) {
  return controller.put(req, id);
}

export async function DELETE(req: NextRequest, id: number) {
  return controller.delete(req, id);
}