import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { NextRequest, NextResponse } from "next/server";
import { InventoryServiceApi } from "../../service/InventoryServiceApi";
import { transferStockSchema } from "../../validation/schema";

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

    const validatedData = transferStockSchema.parse(body);

    const transfer = await service.transferStock(
      {
        workspaceId,
        ...validatedData,
      },
      context as any
    );

    return NextResponse.json(transfer);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
