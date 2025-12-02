import { PermissionChecker } from "@/@Server/Helpers/PermissionChecker";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import prisma from "@/lib/prisma";
import { PurchaseOrderServiceApi } from "@/modules/purchase-orders/service/PurchaseOrderServiceApi";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/purchase-orders/[id]/receive
 * تایید دریافت کالای سفارش خرید و به‌روزرسانی موجودی
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    await PermissionChecker.requirePermission(context, "purchase-orders.receive");

    const id = parseInt(params.id, 10);

    // ابتدا سفارش خرید را با جزئیات بگیر
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!purchaseOrder) {
      return NextResponse.json(
        { error: "Purchase order not found" },
        { status: 404 }
      );
    }

    if (purchaseOrder.status === "RECEIVED") {
      return NextResponse.json(
        { error: "Purchase order is already received" },
        { status: 400 }
      );
    }

    const service = new PurchaseOrderServiceApi();

    // به‌روزرسانی موجودی
    await service.receivePurchaseOrder(purchaseOrder);

    // تغییر وضعیت به RECEIVED
    const updatedPurchaseOrder = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: "RECEIVED",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        stockMovements: true,
      },
    });

    return NextResponse.json(updatedPurchaseOrder);
  } catch (error: any) {
    console.error("Purchase Order Receive error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    );
  }
}

