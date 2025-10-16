import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "invalid id" }, { status: 400 });
  const res = await (prisma as any).commentLike.upsert({
    where: { commentId_userId: { commentId: id, userId: 0 } },
    update: {},
    create: { commentId: id, userId: 0 },
  });
  return NextResponse.json(res);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "invalid id" }, { status: 400 });
  await (prisma as any).commentLike.deleteMany({
    where: { commentId: id, userId: 0 },
  });
  return new NextResponse(null, { status: 204 });
}
