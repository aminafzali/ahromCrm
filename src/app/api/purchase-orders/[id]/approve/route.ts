import { PermissionChecker } from "@/@Server/Helpers/PermissionChecker";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { PurchaseOrderServiceApi } from "@/modules/purchase-orders/service/PurchaseOrderServiceApi";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/purchase-orders/[id]/approve
 * تایید سفارش خرید
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
    await PermissionChecker.requirePermission(
      context,
      "purchase-orders.approve"
    );

    const id = parseInt(params.id, 10);
    const service = new PurchaseOrderServiceApi();
    const purchaseOrder = await service.approve(id);

    return NextResponse.json(purchaseOrder);
  } catch (error: any) {
    console.error("Purchase Order Approve error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    );
  }
}
