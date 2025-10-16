import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, name } = body || {};
    if (!workspaceId || !name) {
      return NextResponse.json(
        { error: "workspaceId and name are required" },
        { status: 400 }
      );
    }

    const existing = await (prisma as any).chatRoom.findFirst({
      where: { workspaceId: Number(workspaceId), title: String(name) },
    });
    if (existing) {
      return NextResponse.json(existing, { status: 200 });
    }

    const created = await (prisma as any).chatRoom.create({
      data: {
        workspaceId: Number(workspaceId),
        title: String(name),
        type: "DIRECT",
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
