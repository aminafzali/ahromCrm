import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { LabelServiceApi } from "../service/LabelServiceApi";

const service = new LabelServiceApi();

class LabelController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new LabelController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}