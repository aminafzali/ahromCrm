import { PermissionChecker } from "@/@Server/Helpers/PermissionChecker";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import prisma from "@/lib/prisma";
import { PurchaseOrderServiceApi } from "@/modules/purchase-orders/service/PurchaseOrderServiceApi";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/purchase-orders
 * لیست سفارشات خرید
 */
export async function GET(request: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    await PermissionChecker.requirePermission(context, "purchase-orders.view");

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const status = searchParams.get("status");

    const where: any = {
      workspaceId: context.workspaceId ?? undefined,
    };

    if (status) {
      where.status = status;
    }

    const [purchaseOrders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          items: {
            include: {
              product: true,
            },
          },
          supplierWorkspaceUser: {
            include: {
              user: true,
            },
          },
          linkedInvoice: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    return NextResponse.json({
      data: purchaseOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Purchase Orders GET error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    );
  }
}

/**
 * POST /api/purchase-orders
 * ایجاد سفارش خرید جدید
 * body:
 *  - supplierWorkspaceUserId?: number
 *  - status?: string
 *  - notes?: string
 *  - items: [{ productId, quantity, unitPrice }]
 */
export async function POST(request: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    await PermissionChecker.requirePermission(
      context,
      "purchase-orders.create"
    );

    const body = await request.json();

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "items are required and must be a non-empty array" },
        { status: 400 }
      );
    }

    const service = new PurchaseOrderServiceApi();
    const purchaseOrder = await service.create(body, context);

    return NextResponse.json(purchaseOrder, { status: 201 });
  } catch (error: any) {
    console.error("Purchase Orders POST error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    );
  }
}
