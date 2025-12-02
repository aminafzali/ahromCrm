import { PermissionChecker } from "@/@Server/Helpers/PermissionChecker";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/payment-gateways
 * لیست درگاه‌های پرداخت
 */
export async function GET(request: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    await PermissionChecker.requirePermission(context, "payment-gateway.view");

    const gateways = await prisma.paymentGatewayConfig.findMany({
      where: { workspaceId: context.workspaceId ?? undefined },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: gateways });
  } catch (error: any) {
    console.error("Payment Gateway GET error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    );
  }
}

/**
 * POST /api/payment-gateways
 * ایجاد تنظیمات درگاه پرداخت جدید
 * body:
 *  - name: string
 *  - gatewayType: string
 *  - apiKey: string
 *  - merchantId: string
 *  - config?: object
 *  - isActive: boolean
 *  - isDefault: boolean
 */
export async function POST(request: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    await PermissionChecker.requirePermission(context, "payment-gateway.manage");

    const body = await request.json();
    const {
      name,
      gatewayType,
      apiKey,
      merchantId,
      config,
      isActive,
      isDefault,
    } = body || {};

    if (!name || !gatewayType || !merchantId) {
      return NextResponse.json(
        { error: "name, gatewayType, and merchantId are required" },
        { status: 400 }
      );
    }

    // اگر isDefault=true است، بقیه رو false کن
    if (isDefault) {
      await prisma.paymentGatewayConfig.updateMany({
        where: { workspaceId: context.workspaceId! },
        data: { isDefault: false },
      });
    }

    const gateway = await prisma.paymentGatewayConfig.create({
      data: {
        workspaceId: context.workspaceId!,
        name,
        gatewayType,
        apiKey: apiKey || "",
        merchantId,
        config: config || {},
        isActive: isActive ?? true,
        isDefault: isDefault ?? false,
      },
    });

    return NextResponse.json(gateway, { status: 201 });
  } catch (error: any) {
    console.error("Payment Gateway POST error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    );
  }
}

