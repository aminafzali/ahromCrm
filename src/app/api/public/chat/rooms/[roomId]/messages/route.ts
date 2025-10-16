import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const roomId = Number(params.roomId);
    if (!roomId)
      return NextResponse.json({ error: "Invalid roomId" }, { status: 400 });

    const items = await (prisma as any).chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, displayName: true } },
      },
      take: 100,
    });
    return NextResponse.json({ data: items });
  } catch (e) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const roomId = Number(params.roomId);
    if (!roomId)
      return NextResponse.json({ error: "Invalid roomId" }, { status: 400 });
    const body = await request.json();
    const { text } = body || {};
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }
    const created = await (prisma as any).chatMessage.create({
      data: {
        roomId,
        body: text,
        // anonymous sender -> null; or a system user 0
        // Prisma may require senderId nullable; if not, set to 1 as system
        senderId: 1,
      },
      include: { sender: { select: { id: true, displayName: true } } },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
