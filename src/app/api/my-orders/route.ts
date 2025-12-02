import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceUserId = context.workspaceUser?.id;
    if (!workspaceUserId) {
      return NextResponse.json(
        { error: "workspaceUserId is required" },
        { status: 400 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        workspaceUserId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: orders });
  } catch (error: any) {
    console.error("My Orders GET error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

