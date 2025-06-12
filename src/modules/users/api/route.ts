import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { includeUser } from "../data/fetch";
import { UserServiceApi } from "../service/UserServiceApi";

const service = new UserServiceApi();

class UserController extends BaseController<any> {
  constructor() {
    super(service , includeUser );
  }
}

const controller = new UserController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}
