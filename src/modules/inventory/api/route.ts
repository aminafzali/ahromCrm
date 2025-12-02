import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../data/fetch";
import { InventoryServiceApi } from "../service/InventoryServiceApi";

const service = new InventoryServiceApi();

class InventoryController extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}

const controller = new InventoryController();

export async function GET(req: NextRequest) {
  return controller.getAll(req);
}
