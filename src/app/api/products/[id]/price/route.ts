import { AuthProvider } from "@/@Server/Providers/AuthProvider";
import { ProductServiceApi } from "@/modules/products/service/ProductServiceApi";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id, 10);

    // این API عمومی است و نیاز به احراز هویت ندارد
    // اما اگر کاربر لاگین باشد، قیمت بر اساس گروهش برگردانده می‌شود
    const context = await AuthProvider.isAuthenticated(request);
    const workspaceUserId = context?.workspaceUser?.id;

    const service = new ProductServiceApi();
    const priceInfo = await service.getProductPriceForUser(
      productId,
      workspaceUserId
    );

    return NextResponse.json(priceInfo);
  } catch (error: any) {
    console.error("Product Price GET error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
