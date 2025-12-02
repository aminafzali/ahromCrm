import { AuthContext } from "@/@Server/Http/Controller/BaseController";
import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { ActivePrice } from "../types";
import {
  createPriceListSchema,
  updatePriceListSchema,
} from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("ProductPriceList");
  }
}

export class ProductPriceListServiceApi extends BaseService<any> {
  constructor() {
    const repository = new Repository();
    super(
      repository,
      createPriceListSchema,
      updatePriceListSchema,
      [],
      ["product", "userGroup"]
    );
    this.repository = repository;
  }

  /**
   * دریافت قیمت محصول برای گروه کاربری خاص
   */
  async getProductPriceForUserGroup(
    productId: number,
    userGroupId: number
  ): Promise<ActivePrice | null> {
    const priceList = await prisma.productPriceList.findUnique({
      where: {
        productId_userGroupId: {
          productId,
          userGroupId,
        },
      },
      include: {
        product: {
          select: {
            price: true,
          },
        },
      },
    });

    if (!priceList || !priceList.isActive) {
      // اگر لیست قیمت وجود نداشت، قیمت پایه محصول را برگردان
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { price: true },
      });

      if (!product) return null;

      return {
        basePrice: product.price,
        finalPrice: product.price,
        hasDiscount: false,
        isDiscountActive: false,
      };
    }

    // بررسی تخفیف
    const now = new Date();
    const hasDiscount = !!priceList.discountPrice;
    const isDiscountActive =
      hasDiscount &&
      (!priceList.discountStartDate || priceList.discountStartDate <= now) &&
      (!priceList.discountEndDate || priceList.discountEndDate >= now);

    const finalPrice = isDiscountActive
      ? priceList.discountPrice!
      : priceList.price;

    return {
      basePrice: priceList.price,
      finalPrice,
      discountPrice: priceList.discountPrice || undefined,
      discountPercent: priceList.discountPercent || undefined,
      hasDiscount,
      isDiscountActive,
    };
  }

  /**
   * دریافت تمام لیست‌های قیمت یک محصول
   */
  async getProductPriceLists(productId: number) {
    return await prisma.productPriceList.findMany({
      where: { productId },
      include: {
        userGroup: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * دریافت تمام لیست‌های قیمت یک گروه کاربری
   */
  async getUserGroupPriceLists(userGroupId: number) {
    return await prisma.productPriceList.findMany({
      where: { userGroupId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * به‌روزرسانی دسته‌جمعی قیمت‌ها برای یک گروه کاربری
   */
  async bulkUpdatePrices(
    productIds: number[],
    userGroupId: number,
    priceModifier: { type: "FIXED" | "PERCENTAGE"; value: number },
    _context?: AuthContext
  ) {
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        price: true,
      },
    });

    const updates = products.map(async (product) => {
      let newPrice: number;

      if (priceModifier.type === "FIXED") {
        newPrice = priceModifier.value;
      } else {
        // PERCENTAGE
        newPrice = product.price * (1 + priceModifier.value / 100);
      }

      return await prisma.productPriceList.upsert({
        where: {
          productId_userGroupId: {
            productId: product.id,
            userGroupId,
          },
        },
        update: {
          price: newPrice,
        },
        create: {
          productId: product.id,
          userGroupId,
          price: newPrice,
          isActive: true,
        },
      });
    });

    return await Promise.all(updates);
  }

  /**
   * حذف لیست‌های قیمت منقضی شده
   */
  async deleteExpiredPriceLists() {
    const now = new Date();

    return await prisma.productPriceList.deleteMany({
      where: {
        discountEndDate: {
          lt: now,
        },
        discountPrice: {
          not: null,
        },
      },
    });
  }
}

