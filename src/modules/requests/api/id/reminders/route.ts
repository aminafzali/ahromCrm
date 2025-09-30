import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { include } from "@/modules/notifications/data/fetch";
import { RequestServiceApi } from "@/modules/requests/service/RequestServiceApi";
import { NextRequest } from "next/server";

const service = new RequestServiceApi();

class RequestController extends BaseController<any> {
  constructor() {
    super(service, include , true);
  }
}

const controller = new RequestController();


export async function POST(
  req: NextRequest, id : number // ✅ Correct format
) {
  return controller.createReminder(req, id); // ✅ Convert id to number
}
