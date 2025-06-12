import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../../../data/fetch";
import { RequestServiceApi } from "../../../service/RequestServiceApi";

const service = new RequestServiceApi();

class RequestController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new RequestController();

export async function PATCH(
  req: NextRequest, id : number // ✅ Correct format
) {
  return controller.updateStatus(req, id); // ✅ Convert id to number
}

