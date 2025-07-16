// مسیر فایل: src/modules/workspaces/api/[id]/route.ts

import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { NextRequest } from "next/server";
import { include } from "../../data/fetch";
import { WorkspaceApiService } from "../../service/WorkspaceApiService";

const service = new WorkspaceApiService();

class WorkspaceController extends BaseController<any> {
  constructor() {
    super(service, include, false);
  }
}

const controller = new WorkspaceController();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return controller.getById(req, params.id);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return controller.update(req, params.id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return controller.delete(req, params.id);
}
