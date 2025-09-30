import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../../../data/fetch";
import { ServiceTypeServiceApi } from "../../../service/ServiceTypeServiceApi";

const service = new ServiceTypeServiceApi();

class ServiceTypeController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new ServiceTypeController();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  const { id } = await params;
  return controller.updateStatus(req, id);
}