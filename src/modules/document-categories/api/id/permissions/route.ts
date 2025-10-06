import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Upsert team permission on a specific document category
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const context = await AuthProvider.isAuthenticated(req);
  if (!context.workspaceId) {
    return NextResponse.json(
      { error: "Workspace not identified" },
      { status: 400 }
    );
  }
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

  const categoryId = Number(params.id);
  const body = await req.json();
  const {
    teamId,
    canRead = true,
    canWrite = false,
    canDelete = false,
  } = body || {};
  if (!teamId)
    return NextResponse.json({ error: "teamId is required" }, { status: 400 });

  const result = await (prisma as any).teamCategoryPermission.upsert({
    where: { teamId_categoryId: { teamId: Number(teamId), categoryId } },
    update: {
      canRead: !!canRead,
      canWrite: !!canWrite,
      canDelete: !!canDelete,
    },
    create: {
      workspaceId: Number(context.workspaceId),
      teamId: Number(teamId),
      categoryId,
      canRead: !!canRead,
      canWrite: !!canWrite,
      canDelete: !!canDelete,
    },
  });
  return NextResponse.json(result);
}

// Remove team permission on a specific category
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const context = await AuthProvider.isAuthenticated(req);
  if (!context.workspaceId) {
    return NextResponse.json(
      { error: "Workspace not identified" },
      { status: 400 }
    );
  }
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
  const categoryId = Number(params.id);
  const body = await req.json();
  const { teamId } = body || {};
  if (!teamId)
    return NextResponse.json({ error: "teamId is required" }, { status: 400 });

  await (prisma as any).teamCategoryPermission.delete({
    where: { teamId_categoryId: { teamId: Number(teamId), categoryId } },
  });
  return new NextResponse(null, { status: 204 });
}
