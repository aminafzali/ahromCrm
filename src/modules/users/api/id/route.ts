import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { includeUser } from "../../data/fetch";
import { UserServiceApi } from "../../service/UserServiceApi";

const service = new UserServiceApi();

class UserController extends BaseController<any> {
  constructor() {
    super(service , includeUser);
  }
}

const controller = new UserController();

export async function GET(
  req: NextRequest, id : number // ✅ Correct format
) {
  return controller.getById(req, id); // ✅ Convert id to number
}

export async function PATCH(
  req: NextRequest, id : number // ✅ Correct format
) {
  return controller.update(req, id); // ✅ Convert id to number
}

export async function POST(
  req: NextRequest, id : number // ✅ Correct format
) {
  return controller.update(req, id); // ✅ Convert id to number
}


export async function DELETE(
  req: NextRequest, id : number // ✅ Correct format
) {
  return controller.delete(req, id); // ✅ Convert id to number
}
