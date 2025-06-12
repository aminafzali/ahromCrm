import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { UserGroupServiceApi } from "../service/UserGroupServiceApi";

const service = new UserGroupServiceApi();

class UserGroupController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new UserGroupController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}