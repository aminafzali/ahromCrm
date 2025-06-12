import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { StatusServiceApi } from "../service/StatusServiceApi";

const service = new StatusServiceApi();

class StatusController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new StatusController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}