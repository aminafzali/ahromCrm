import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { CategoryServiceApi } from "../service/CategoryServiceApi";

const service = new CategoryServiceApi();

class CategoryController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new CategoryController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}