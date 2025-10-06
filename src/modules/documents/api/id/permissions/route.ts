import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Upsert team permission on a specific document
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.info("[DOC_PERM][POST] called", { id: params?.id });
  const context = await AuthProvider.isAuthenticated(req);
  console.debug("[DOC_PERM][POST] auth", {
    workspaceId: context.workspaceId,
    role: context.role?.name,
    userId: context.workspaceUser?.id,
  });
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

  const docId = Number(params.id);
  const body = await req.json();
  const {
    teamId,
    canRead = true,
    canWrite = false,
    canDelete = false,
  } = body || {};
  if (!teamId)
    return NextResponse.json({ error: "teamId is required" }, { status: 400 });

  console.debug("[DOC_PERM][POST] upsert payload", {
    docId,
    teamId,
    canRead,
    canWrite,
    canDelete,
  });
  const result = await (prisma as any).teamDocumentPermission.upsert({
    where: { teamId_documentId: { teamId: Number(teamId), documentId: docId } },
    update: {
      canRead: !!canRead,
      canWrite: !!canWrite,
      canDelete: !!canDelete,
    },
    create: {
      workspaceId: Number(context.workspaceId),
      teamId: Number(teamId),
      documentId: docId,
      canRead: !!canRead,
      canWrite: !!canWrite,
      canDelete: !!canDelete,
    },
  });
  console.info("[DOC_PERM][POST] success", { id: result?.id });
  return NextResponse.json(result);
}

// Remove team permission on a specific document
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.info("[DOC_PERM][DELETE] called", { id: params?.id });
  const context = await AuthProvider.isAuthenticated(req);
  console.debug("[DOC_PERM][DELETE] auth", {
    workspaceId: context.workspaceId,
    role: context.role?.name,
    userId: context.workspaceUser?.id,
  });
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
  const docId = Number(params.id);
  const body = await req.json();
  const { teamId } = body || {};
  if (!teamId)
    return NextResponse.json({ error: "teamId is required" }, { status: 400 });

  console.debug("[DOC_PERM][DELETE] delete payload", { docId, teamId });
  await (prisma as any).teamDocumentPermission.delete({
    where: { teamId_documentId: { teamId: Number(teamId), documentId: docId } },
  });
  console.info("[DOC_PERM][DELETE] success");
  return new NextResponse(null, { status: 204 });
}
