import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { connects, relations, searchFileds } from "../data/fetch";
import {
  createShippingMethodSchema,
  updateShippingMethodSchema,
} from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("ShippingMethod");
  }
}

export class ShippingServiceApi extends BaseService<any> {
  constructor() {
    const repository = new Repository();
    super(
      repository,
      createShippingMethodSchema,
      updateShippingMethodSchema,
      searchFileds,
      relations
    );
    this.connect = connects;
    this.repository = repository;
  }

  /**
   * محاسبه هزینه حمل و نقل بر اساس روش ارسال و آیتم‌های سبد خرید
   */
  async calculateShippingCost(params: {
    workspaceId: number;
    shippingMethodId: number;
    items: Array<{ productId: number; quantity: number }>;
    zone?: { province?: string; city?: string };
  }): Promise<number> {
    const { workspaceId, shippingMethodId, items, zone } = params;

    const shippingMethod = await prisma.shippingMethod.findUnique({
      where: { id: shippingMethodId },
      include: {
        zones: true,
      },
    });

    if (!shippingMethod || !shippingMethod.isActive) {
      throw new Error("Shipping method not found or inactive");
    }

    const basePrice = shippingMethod.basePrice;

    // محاسبه بر اساس نوع روش ارسال
    switch (shippingMethod.type) {
      case "FIXED":
        // قیمت ثابت
        return basePrice;

      case "BY_WEIGHT":
        // محاسبه بر اساس وزن (نیاز به فیلد weight در Product)
        // فعلاً از تعداد آیتم‌ها استفاده می‌کنیم
        const totalQuantity = items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        return basePrice * totalQuantity;

      case "BY_CART_VALUE":
        // محاسبه بر اساس ارزش سبد خرید
        const cartValue = await this.calculateCartValue(items);
        const settings = shippingMethod.settings as any;
        if (
          settings?.freeShippingThreshold &&
          cartValue >= settings.freeShippingThreshold
        ) {
          return 0;
        }
        return basePrice;

      case "BY_DISTANCE":
        // محاسبه بر اساس فاصله (نیاز به zone)
        if (zone) {
          const zoneExtra = await this.getZoneExtraCost(shippingMethodId, zone);
          return basePrice + zoneExtra;
        }
        return basePrice;

      default:
        return basePrice;
    }
  }

  /**
   * محاسبه ارزش سبد خرید
   */
  private async calculateCartValue(
    items: Array<{ productId: number; quantity: number }>
  ): Promise<number> {
    let total = 0;
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { price: true },
      });
      if (product) {
        total += product.price * item.quantity;
      }
    }
    return total;
  }

  /**
   * دریافت هزینه اضافی برای zone
   */
  private async getZoneExtraCost(
    shippingMethodId: number,
    zone: { province?: string; city?: string }
  ): Promise<number> {
    // پیدا کردن همه zone‌ها و بررسی دستی
    const allZones = await prisma.shippingZone.findMany({
      where: {
        workspaceId: (
          await prisma.shippingMethod.findUnique({
            where: { id: shippingMethodId },
            select: { workspaceId: true },
          })
        )?.workspaceId,
      },
    });

    let foundZoneId: number | null = null;
    for (const z of allZones) {
      const provinces = (z.provinces as string[]) || [];
      const cities = (z.cities as string[]) || [];
      if (
        (zone.province && provinces.includes(zone.province)) ||
        (zone.city && cities.includes(zone.city))
      ) {
        foundZoneId = z.id;
        break;
      }
    }

    if (!foundZoneId) {
      return 0;
    }

    const methodZone = await prisma.shippingMethodZone.findFirst({
      where: {
        shippingMethodId,
        shippingZoneId: foundZoneId,
      },
    });

    return methodZone?.extraCost || 0;
  }
}
