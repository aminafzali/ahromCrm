import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { PermissionChecker } from "@/@Server/Helpers/PermissionChecker";
import { PurchaseOrderServiceApi } from "@/modules/purchase-orders/service/PurchaseOrderServiceApi";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/purchase-orders/[id]
 * دریافت جزئیات یک سفارش خرید
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    await PermissionChecker.requirePermission(context, "purchase-orders.view");

    const id = parseInt(params.id, 10);

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        supplierWorkspaceUser: {
          include: {
            user: true,
          },
        },
        linkedInvoice: true,
        stockMovements: true,
      },
    });

    if (!purchaseOrder) {
      return NextResponse.json(
        { error: "Purchase order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(purchaseOrder);
  } catch (error: any) {
    console.error("Purchase Order GET error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    );
  }
}

/**
 * PATCH /api/purchase-orders/[id]
 * ویرایش سفارش خرید
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
    await PermissionChecker.requirePermission(context, "purchase-orders.update");

    const id = parseInt(params.id, 10);
    const body = await request.json();

    const purchaseOrder = await prisma.purchaseOrder.update({
      where: { id },
      data: body,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(purchaseOrder);
  } catch (error: any) {
    console.error("Purchase Order PATCH error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    );
  }
}

/**
 * DELETE /api/purchase-orders/[id]
 * حذف سفارش خرید
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
    await PermissionChecker.requirePermission(context, "purchase-orders.update");

    const id = parseInt(params.id, 10);

    // بررسی اینکه آیا سفارش خرید به فاکتور متصل است
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (purchaseOrder?.linkedInvoiceId) {
      return NextResponse.json(
        {
          error:
            "Cannot delete purchase order that is linked to an invoice",
        },
        { status: 400 }
      );
    }

    await prisma.purchaseOrder.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Purchase Order DELETE error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    );
  }
}

