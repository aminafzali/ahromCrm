import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await AuthProvider.isAuthenticated(req);
    if (!context.workspaceUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "invalid id" }, { status: 400 });

    const workspaceUserId = context.workspaceUser.id;

    const res = await (prisma as any).commentLike.upsert({
      where: {
        commentId_workspaceUserId: {
          commentId: id,
          workspaceUserId: workspaceUserId,
        },
      },
      update: {},
      create: {
        commentId: id,
        workspaceUserId: workspaceUserId,
      },
    });

    // Update likeCount
    const likeCount = await (prisma as any).commentLike.count({
      where: { commentId: id },
    });
    await (prisma as any).comment.update({
      where: { id },
      data: { likeCount },
    });

    return NextResponse.json(res);
  } catch (error: any) {
    console.error("[CommentLike] POST error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.statusCode || 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await AuthProvider.isAuthenticated(req);
    if (!context.workspaceUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "invalid id" }, { status: 400 });

    const workspaceUserId = context.workspaceUser.id;

    await (prisma as any).commentLike.deleteMany({
      where: {
        commentId: id,
        workspaceUserId: workspaceUserId,
      },
    });

    // Update likeCount
    const likeCount = await (prisma as any).commentLike.count({
      where: { commentId: id },
    });
    await (prisma as any).comment.update({
      where: { id },
      data: { likeCount },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("[CommentLike] DELETE error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.statusCode || 500 }
    );
  }
}
