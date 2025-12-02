import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { NextRequest, NextResponse } from "next/server";
import { PaymentGatewayServiceApi } from "../../service/PaymentGatewayServiceApi";

const service = new PaymentGatewayServiceApi();

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
    const { orderId, invoiceId, amount, callbackUrl } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const result = await service.createGatewayRequest({
      workspaceId,
      orderId,
      invoiceId,
      amount,
      callbackUrl,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
