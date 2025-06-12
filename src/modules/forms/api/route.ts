import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { includeForms } from "../data/fetch";
import { FormServiceApi } from "../service/FormServiceApi";

const service = new FormServiceApi();

class UserController extends BaseController<any> {
  constructor() {
    super(service , includeForms );
  }
}

const controller = new UserController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}

export async function POST(req: NextRequest) {
  return controller.create(req);
}
