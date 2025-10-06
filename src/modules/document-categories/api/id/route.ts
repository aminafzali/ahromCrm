import { BaseController } from "@/@Server/Http/Controller/BaseController";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { include } from "../../data/fetch";
import { DocumentCategoryServiceApi } from "../../service/DocumentCategoryServiceApi";

const service = new DocumentCategoryServiceApi();
class Controller extends BaseController<any> {
  constructor() {
    super(service, include);
  }
}
const controller = new Controller();

export async function GET(req: NextRequest, id: number) {
  return controller.getById(req, id);
}

export async function PATCH(req: NextRequest, id: number) {
  const context = await AuthProvider.isAuthenticated(req);
  if (context.role?.name !== "Admin") {
    const policy = await (prisma as any).roleDocumentPolicy.findUnique({
      where: {
        workspaceId_roleId: {
          workspaceId: Number(context.workspaceId),
          roleId: context.role!.id,
        },
      },
      select: { canWrite: true },
    });
    if (!policy?.canWrite) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }
  }
  return controller.update(req, id);
}

export async function DELETE(req: NextRequest, id: number) {
  const context = await AuthProvider.isAuthenticated(req);
  if (context.role?.name !== "Admin") {
    const policy = await (prisma as any).roleDocumentPolicy.findUnique({
      where: {
        workspaceId_roleId: {
          workspaceId: Number(context.workspaceId),
          roleId: context.role!.id,
        },
      },
      select: { canDelete: true },
    });
    if (!policy?.canDelete) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }
  }
  return controller.delete(req, id);
}
