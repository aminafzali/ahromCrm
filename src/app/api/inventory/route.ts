import { PermissionChecker } from "@/@Server/Helpers/PermissionChecker";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { InventoryServiceApi } from "@/modules/inventory/service/InventoryServiceApi";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/inventory
 * لیست موجودی محصولات (تجمیعی یا بر اساس انبار)
 * query params:
 *  - productId?: number
 *  - warehouseId?: number
 *  - workspaceId?: number (در صورت عدم ارسال، از context گرفته می‌شود)
 */
export async function GET(request: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    await PermissionChecker.requirePermission(context, "inventory.view");

    const { searchParams } = new URL(request.url);
    const productIdParam = searchParams.get("productId");
    const warehouseIdParam = searchParams.get("warehouseId");
    const workspaceIdParam = searchParams.get("workspaceId");

    if (!productIdParam) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    const workspaceId =
      workspaceIdParam !== null
        ? parseInt(workspaceIdParam, 10)
        : context.workspaceId!;

    const productId = parseInt(productIdParam, 10);
    const warehouseId = warehouseIdParam
      ? parseInt(warehouseIdParam, 10)
      : undefined;

    const service = new InventoryServiceApi();
    const quantity = await service.getProductStock({
      workspaceId,
      productId,
      warehouseId,
    });

    return NextResponse.json({ workspaceId, productId, warehouseId, quantity });
  } catch (error) {
    console.error("Inventory GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/inventory
 * تنظیم موجودی / ثبت حرکت انبار
 * body:
 *  - workspaceId?: number (در صورت عدم ارسال، از context گرفته می‌شود)
 *  - warehouseId: number
 *  - productId: number
 *  - quantity: number (مثبت = ورود، منفی = خروج)
 *  - movementType: StockMovementType
 *  - invoiceId?, orderId?, purchaseOrderId?, description?
 */
export async function POST(request: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    await PermissionChecker.requirePermission(context, "inventory.manage");

    const body = await request.json();
    const {
      workspaceId: workspaceIdInput,
      warehouseId,
      productId,
      quantity,
      movementType,
      invoiceId,
      orderId,
      purchaseOrderId,
      description,
    } = body || {};

    if (
      !warehouseId ||
      !productId ||
      quantity === undefined ||
      quantity === null ||
      !movementType
    ) {
      return NextResponse.json(
        {
          error:
            "warehouseId, productId, quantity and movementType are required",
        },
        { status: 400 }
      );
    }

    const workspaceId = workspaceIdInput ?? context.workspaceId;

    const service = new InventoryServiceApi();
    const movement = await service.adjustStock(
      {
        workspaceId,
        warehouseId,
        productId,
        quantity,
        movementType,
        invoiceId,
        orderId,
        purchaseOrderId,
        description,
      },
      context
    );

    return NextResponse.json(movement, { status: 201 });
  } catch (error) {
    console.error("Inventory POST error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
