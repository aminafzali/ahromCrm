import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { includeForms } from "../../data/fetch";
import { FormServiceApi } from "../../service/FormServiceApi";

const service = new FormServiceApi();

class UserController extends BaseController<any> {
  constructor() {
    super(service , includeForms);
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


export async function PUT(req: NextRequest, id: number) {
  return controller.put(req, id);
}


export async function DELETE(
  req: NextRequest, id : number // ✅ Correct format
) {
  return controller.delete(req, id); // ✅ Convert id to number
}
