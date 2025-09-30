import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../../data/fetch";
import { BrandServiceApi } from "../../service/BrandServiceApi";

const service = new BrandServiceApi();

class BrandController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new BrandController();

export async function GET(req: NextRequest, id: number) {
  return controller.getById(req, id);
}

export async function PATCH(req: NextRequest, id: number) {
  return controller.update(req, id);
}

export async function DELETE(req: NextRequest, id: number) {
  return controller.delete(req, id);
}