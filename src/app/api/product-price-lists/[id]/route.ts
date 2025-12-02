import { PermissionChecker } from "@/@Server/Helpers/PermissionChecker";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { ProductPriceListServiceApi } from "@/modules/product-price-lists/service/ProductPriceListServiceApi";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await PermissionChecker.requirePermission(context, "products.view");

    const id = parseInt(params.id, 10);
    const service = new ProductPriceListServiceApi();
    const priceList = await service.getById(id);

    if (!priceList) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(priceList);
  } catch (error: any) {
    console.error("Price List GET error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await PermissionChecker.requirePermission(context, "products.manage");

    const id = parseInt(params.id, 10);
    const body = await request.json();
    const service = new ProductPriceListServiceApi();
    const priceList = await service.update(id, body);

    return NextResponse.json(priceList);
  } catch (error: any) {
    console.error("Price List PUT error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await PermissionChecker.requirePermission(context, "products.manage");

    const id = parseInt(params.id, 10);
    const service = new ProductPriceListServiceApi();
    await service.delete(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Price List DELETE error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    );
  }
}
