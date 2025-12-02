import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { NextRequest, NextResponse } from "next/server";
import { OrderServiceApi } from "../../../service/OrderServiceApi";

const service = new OrderServiceApi();

export async function POST(req: NextRequest, id: number) {
  try {
    const context = await AuthProvider.isAuthenticated(req);
    if (!context.workspaceId || !context.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    const invoice = await service.createInvoiceFromOrder(id, context as any);
    return NextResponse.json(invoice);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
