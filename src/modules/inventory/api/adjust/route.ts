import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { NextRequest, NextResponse } from "next/server";
import { InventoryServiceApi } from "../../service/InventoryServiceApi";
import { adjustStockSchema } from "../../validation/schema";

const service = new InventoryServiceApi();

export async function POST(req: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(req);
    if (!context.workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID required" },
        { status: 401 }
      );
    }
    const workspaceId = context.workspaceId;
    const body = await req.json();

    const validatedData = adjustStockSchema.parse(body);

    const movement = await service.adjustStock(
      {
        workspaceId,
        ...validatedData,
      },
      context as any
    );

    return NextResponse.json(movement);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
