import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../../data/fetch";
import { StatusServiceApi } from "../../service/StatusServiceApi";

const service = new StatusServiceApi();

class StatusController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new StatusController();

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


export async function DELETE(
  req: NextRequest, id : number // ✅ Correct format
) {
  return controller.delete(req, id); // ✅ Convert id to number
}
