import { PermissionChecker } from "@/@Server/Helpers/PermissionChecker";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { PurchaseOrderServiceApi } from "@/modules/purchase-orders/service/PurchaseOrderServiceApi";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/purchase-orders/[id]/convert-to-invoice
 * تبدیل سفارش خرید به فاکتور خرید
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

    // Check permission - نیاز به دسترسی ایجاد فاکتور هم دارد
    await PermissionChecker.requirePermission(
      context,
      "purchase-orders.approve"
    );

    const id = parseInt(params.id, 10);
    const service = new PurchaseOrderServiceApi();
    const invoice = await service.convertToInvoice(id, context);

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    console.error("Purchase Order Convert to Invoice error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    );
  }
}
