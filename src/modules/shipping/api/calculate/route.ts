import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { NextRequest, NextResponse } from "next/server";
import { ShippingServiceApi } from "../../service/ShippingServiceApi";
import { calculateShippingCostSchema } from "../../validation/schema";

const service = new ShippingServiceApi();

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

    const validatedData = calculateShippingCostSchema.parse(body);

    const cost = await service.calculateShippingCost({
      workspaceId,
      ...validatedData,
    });

    return NextResponse.json({ cost });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
