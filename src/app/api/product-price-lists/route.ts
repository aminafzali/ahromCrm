import { PermissionChecker } from "@/@Server/Helpers/PermissionChecker";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { ProductPriceListServiceApi } from "@/modules/product-price-lists/service/ProductPriceListServiceApi";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await PermissionChecker.requirePermission(context, "products.view");

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const userGroupId = searchParams.get("userGroupId");

    const service = new ProductPriceListServiceApi();

    if (productId) {
      const priceLists = await service.getProductPriceLists(
        parseInt(productId, 10)
      );
      return NextResponse.json({ data: priceLists });
    }

    if (userGroupId) {
      const priceLists = await service.getUserGroupPriceLists(
        parseInt(userGroupId, 10)
      );
      return NextResponse.json({ data: priceLists });
    }

    return NextResponse.json(
      { error: "productId or userGroupId is required" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Price Lists GET error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await AuthProvider.isAuthenticated(request);
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await PermissionChecker.requirePermission(context, "products.manage");

    const body = await request.json();
    const service = new ProductPriceListServiceApi();
    const priceList = await service.create(body, context);

    return NextResponse.json(priceList, { status: 201 });
  } catch (error: any) {
    console.error("Price List POST error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    );
  }
}
