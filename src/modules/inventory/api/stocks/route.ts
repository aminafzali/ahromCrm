import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { NextRequest, NextResponse } from "next/server";
import { InventoryServiceApi } from "../../service/InventoryServiceApi";
import { getProductStockSchema } from "../../validation/schema";

const service = new InventoryServiceApi();

export async function GET(req: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(req);
    if (!context.workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID required" },
        { status: 401 }
      );
    }
    const workspaceId = context.workspaceId;
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const warehouseId = searchParams.get("warehouseId");

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    const params = getProductStockSchema.parse({
      productId: parseInt(productId, 10),
      warehouseId: warehouseId ? parseInt(warehouseId, 10) : undefined,
    });

    const stock = await service.getProductStock({
      workspaceId,
      ...params,
    });

    return NextResponse.json({ stock });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
