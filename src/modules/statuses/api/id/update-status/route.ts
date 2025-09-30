import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../../../data/fetch";
import { StatusServiceApi } from "../../../service/StatusServiceApi";

const service = new StatusServiceApi();

class StatusController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new StatusController();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  const { id } = await params;
  return controller.updateStatus(req, id);
}