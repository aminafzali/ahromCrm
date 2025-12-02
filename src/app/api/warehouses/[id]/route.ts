import { PermissionChecker } from "@/@Server/Helpers/PermissionChecker";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await PermissionChecker.requirePermission(context, "inventory.view");

    const id = parseInt(params.id, 10);

    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
    });

    if (!warehouse) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(warehouse);
  } catch (error: any) {
    console.error("Warehouse GET error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await PermissionChecker.requirePermission(context, "inventory.manage");

    const id = parseInt(params.id, 10);
    const body = await request.json();

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(warehouse);
  } catch (error: any) {
    console.error("Warehouse PUT error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await PermissionChecker.requirePermission(context, "inventory.manage");

    const id = parseInt(params.id, 10);

    await prisma.warehouse.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Warehouse DELETE error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    );
  }
}
