import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../../data/fetch";
import { RequestServiceApi } from "../../service/RequestServiceApi";

const service = new RequestServiceApi();

class RequestController extends BaseController<any> {
  constructor() {
    super(service, include , true);
  }
}

const controller = new RequestController();


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
