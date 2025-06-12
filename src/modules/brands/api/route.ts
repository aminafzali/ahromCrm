import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { BrandServiceApi } from "../service/BrandServiceApi";

const service = new BrandServiceApi();

class BrandController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new BrandController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}