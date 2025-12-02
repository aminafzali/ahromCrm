import { PermissionChecker } from "@/@Server/Helpers/PermissionChecker";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/shipping/[id]
 * ویرایش روش ارسال
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    await PermissionChecker.requirePermission(context, "shipping.manage");

    const id = parseInt(params.id, 10);
    const body = await request.json();

    const method = await prisma.shippingMethod.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(method);
  } catch (error: any) {
    console.error("Shipping PATCH error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    );
  }
}

/**
 * DELETE /api/shipping/[id]
 * حذف روش ارسال
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    await PermissionChecker.requirePermission(context, "shipping.manage");

    const id = parseInt(params.id, 10);

    await prisma.shippingMethod.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Shipping DELETE error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    );
  }
}

