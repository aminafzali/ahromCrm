import { PermissionChecker } from "@/@Server/Helpers/PermissionChecker";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { InventoryServiceApi } from "@/modules/inventory/service/InventoryServiceApi";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await PermissionChecker.requirePermission(context, "inventory.view");

    const { searchParams } = new URL(request.url);
    const productIdParam = searchParams.get("productId");
    const warehouseIdParam = searchParams.get("warehouseId");
    const limitParam = searchParams.get("limit");

    const workspaceId = context.workspaceId;
    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    const service = new InventoryServiceApi();
    const history = await service.getStockHistory({
      workspaceId,
      productId: productIdParam ? parseInt(productIdParam, 10) : undefined,
      warehouseId: warehouseIdParam
        ? parseInt(warehouseIdParam, 10)
        : undefined,
      limit: limitParam ? parseInt(limitParam, 10) : 50,
    });

    return NextResponse.json({ data: history });
  } catch (error: any) {
    console.error("Inventory History GET error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    );
  }
}
