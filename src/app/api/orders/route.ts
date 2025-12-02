import { PermissionChecker } from "@/@Server/Helpers/PermissionChecker";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import prisma from "@/lib/prisma";
import { OrderServiceApi } from "@/modules/orders/service/OrderServiceApi";
import { ShippingServiceApi } from "@/modules/shipping/service/ShippingServiceApi";
import { OrderStatus, PaymentMethod } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/orders
 * ایجاد سفارش از سبد خرید
 * body:
 *  - workspaceUserId: number
 *  - items: [{ productId, quantity }]
 *  - shippingMethodId?: number
 *  - shippingAddress?: string
 *  - paymentMethod: PaymentMethod
 */
export async function POST(request: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission
    await PermissionChecker.requirePermission(context, "orders.create");

    const body = await request.json();
    const {
      workspaceUserId,
      items,
      shippingMethodId,
      shippingAddress,
      paymentMethod,
    } = body || {};

    if (
      !workspaceUserId ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !paymentMethod
    ) {
      return NextResponse.json(
        {
          error:
            "workspaceUserId, items (non-empty) and paymentMethod are required",
        },
        { status: 400 }
      );
    }

    const workspaceId = context.workspaceId;

    // محاسبه قیمت آیتم‌ها از روی Product.price
    const productIds = Array.from(
      new Set(items.map((it: any) => it.productId))
    );
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, workspaceId: workspaceId ?? undefined },
      select: { id: true, price: true },
    });
    const priceMap = new Map(products.map((p) => [p.id, p.price]));

    const normalizedItems = items.map((it: any) => {
      const unitPrice = priceMap.get(it.productId) ?? 0;
      const quantity = Number(it.quantity) || 0;
      const discount = Number(it.discount) || 0;
      const tax = Number(it.tax) || 0;
      const total = unitPrice * quantity - discount + tax;
      return {
        productId: it.productId,
        quantity,
        unitPrice,
        discount,
        tax,
        total,
      };
    });

    const subtotal = normalizedItems.reduce((sum, it) => sum + it.total, 0);

    // محاسبه هزینه حمل
    let shippingCost = 0;
    if (shippingMethodId && workspaceId) {
      const shippingService = new ShippingServiceApi();
      shippingCost = await shippingService.calculateShippingCost({
        workspaceId,
        shippingMethodId,
        items: normalizedItems.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
        })),
      });
    }

    const tax = 0;
    const discount = 0;
    const total = subtotal + shippingCost;

    const orderService = new OrderServiceApi();
    const order = await orderService.create(
      {
        workspaceUser: { id: workspaceUserId },
        status: OrderStatus.NEW,
        isOnline: true,
        subtotal,
        tax,
        discount,
        total,
        shippingCost,
        shippingMethodId,
        shippingAddress,
        paymentMethod: paymentMethod as PaymentMethod,
        items: normalizedItems,
      },
      context
    );

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Create Order error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
