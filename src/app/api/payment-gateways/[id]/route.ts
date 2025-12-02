import { PermissionChecker } from "@/@Server/Helpers/PermissionChecker";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/payment-gateways/[id]
 * ویرایش تنظیمات درگاه پرداخت
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
    await PermissionChecker.requirePermission(context, "payment-gateway.manage");

    const id = parseInt(params.id, 10);
    const body = await request.json();

    // اگر isDefault=true است، بقیه رو false کن
    if (body.isDefault) {
      await prisma.paymentGatewayConfig.updateMany({
        where: { workspaceId: context.workspaceId!, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const gateway = await prisma.paymentGatewayConfig.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(gateway);
  } catch (error: any) {
    console.error("Payment Gateway PATCH error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    );
  }
}

/**
 * DELETE /api/payment-gateways/[id]
 * حذف تنظیمات درگاه پرداخت
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
    await PermissionChecker.requirePermission(context, "payment-gateway.manage");

    const id = parseInt(params.id, 10);

    await prisma.paymentGatewayConfig.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Payment Gateway DELETE error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    );
  }
}

