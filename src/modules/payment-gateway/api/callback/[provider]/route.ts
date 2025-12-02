import { PaymentGatewayProvider } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { PaymentGatewayServiceApi } from "../../../service/PaymentGatewayServiceApi";

const service = new PaymentGatewayServiceApi();

export async function GET(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const provider = params.provider as PaymentGatewayProvider;
    const { searchParams } = new URL(req.url);
    const payload = Object.fromEntries(searchParams.entries());

    const result = await service.handleGatewayCallback(provider, payload);

    // ریدایرکت به صفحه موفقیت یا خطا
    const redirectUrl = result.success
      ? `/panel/orders?payment=success&paymentId=${result.paymentId}`
      : `/panel/orders?payment=failed&paymentId=${result.paymentId}`;

    return NextResponse.redirect(new URL(redirectUrl, req.url));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const provider = params.provider as PaymentGatewayProvider;
    const body = await req.json();

    const result = await service.handleGatewayCallback(provider, body);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
