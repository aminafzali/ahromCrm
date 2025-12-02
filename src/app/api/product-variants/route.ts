import { PermissionChecker } from "@/@Server/Helpers/PermissionChecker";
import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { ProductVariantServiceApi } from "@/modules/product-variants/service/ProductVariantServiceApi";
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

    if (productId) {
      const service = new ProductVariantServiceApi();
      const variants = await service.getProductVariants(
        parseInt(productId, 10)
      );
      return NextResponse.json({ data: variants });
    }

    return NextResponse.json(
      { error: "productId is required" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Product Variants GET error:", error);
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
    const service = new ProductVariantServiceApi();
    const variant = await service.create(body, context);

    return NextResponse.json(variant, { status: 201 });
  } catch (error: any) {
    console.error("Product Variant POST error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.message?.includes("permission") ? 403 : 500 }
    );
  }
}
