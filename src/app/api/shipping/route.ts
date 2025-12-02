import { PermissionChecker } from "@/@Server/Helpers/PermissionChecker";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/shipping
 * لیست روش‌های ارسال
 */
export async function GET(request: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    await PermissionChecker.requirePermission(context, "shipping.view");

    const methods = await prisma.shippingMethod.findMany({
      where: { workspaceId: context.workspaceId ?? undefined },
      include: {
        zones: {
          include: {
            zone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: methods });
  } catch (error: any) {
    console.error("Shipping GET error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    );
  }
}

/**
 * POST /api/shipping
 * ایجاد روش ارسال جدید
 * body:
 *  - name: string
 *  - type: ShippingMethodType
 *  - basePrice: number
 *  - isActive: boolean
 *  - settings?: object
 */
export async function POST(request: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    await PermissionChecker.requirePermission(context, "shipping.manage");

    const body = await request.json();
    const { name, type, basePrice, isActive, settings } = body || {};

    if (!name || !type || basePrice === undefined) {
      return NextResponse.json(
        { error: "name, type, and basePrice are required" },
        { status: 400 }
      );
    }

    const method = await prisma.shippingMethod.create({
      data: {
        workspaceId: context.workspaceId!,
        name,
        type,
        basePrice,
        isActive: isActive ?? true,
        settings: settings || {},
      },
    });

    return NextResponse.json(method, { status: 201 });
  } catch (error: any) {
    console.error("Shipping POST error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    );
  }
}

