import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import {
  createProductVariantSchema,
  updateProductVariantSchema,
} from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("ProductVariant");
  }
}

export class ProductVariantServiceApi extends BaseService<any> {
  constructor() {
    const repository = new Repository();
    super(
      repository,
      createProductVariantSchema,
      updateProductVariantSchema,
      ["name", "sku"],
      ["product"]
    );
    this.repository = repository;
  }

  /**
   * دریافت تمام واریانت‌های یک محصول
   */
  async getProductVariants(productId: number) {
    return await prisma.productVariant.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * دریافت واریانت با SKU
   */
  async getVariantBySku(sku: string) {
    return await prisma.productVariant.findUnique({
      where: { sku },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            workspaceId: true,
          },
        },
      },
    });
  }

  /**
   * به‌روزرسانی موجودی واریانت
   */
  async updateVariantStock(
    variantId: number,
    quantity: number,
    _context?: AuthContext
  ) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      throw new Error("Variant not found");
    }

    const newStock = variant.stock + quantity;

    if (newStock < 0) {
      throw new Error("موجودی کافی نیست");
    }

    return await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: newStock },
    });
  }

  /**
   * غیرفعال کردن واریانت‌های بدون موجودی
   */
  async deactivateOutOfStockVariants(productId: number) {
    return await prisma.productVariant.updateMany({
      where: {
        productId,
        stock: { lte: 0 },
      },
      data: {
        isActive: false,
      },
    });
  }
}

