import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = context.workspaceId;
    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    const userGroups = await prisma.userGroup.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            workspaceUsers: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: userGroups });
  } catch (error: any) {
    console.error("User Groups GET error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
