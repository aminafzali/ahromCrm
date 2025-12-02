import { BaseRepository } from "@/@Server/Http/Repository/BaseRepository";
import { BaseService } from "@/@Server/Http/Service/BaseService";
import prisma from "@/lib/prisma";
import { ProductPriceListServiceApi } from "@/modules/product-price-lists/service/ProductPriceListServiceApi";
import { connects, relations, searchFields } from "../data/fetch";
import { createProductSchema, updateProductSchema } from "../validation/schema";

class Repository extends BaseRepository<any> {
  constructor() {
    super("Product");
  }
}

export class ProductServiceApi extends BaseService<any> {
  private priceListService: ProductPriceListServiceApi;

  constructor() {
    super(
      new Repository(),
      createProductSchema,
      updateProductSchema,
      searchFields,
      relations
    );
    this.repository = new Repository();
    this.connect = connects;
    this.priceListService = new ProductPriceListServiceApi();
    this.beforeCreate = this.handleBeforeCreate;
    this.beforeUpdate = this.handleBeforeUpdate;
    this.afterCreate = this.handleAfterCreate;
    this.afterUpdate = this.handleAfterUpdate;
  }

  /**
   * Hook قبل از ایجاد: مدیریت payment options و visibility
   */
  private async handleBeforeCreate(data: any, context: any): Promise<any> {
    const {
      paymentOptions,
      visibilityByGroup,
      paymentOptionsByGroup,
      ...rest
    } = data;
    return rest;
  }

  /**
   * Hook بعد از ایجاد: ثبت payment options و visibility
   */
  private async handleAfterCreate(entity: any, data: any): Promise<void> {
    await this.syncPaymentOptionsAndVisibility(entity.id, data);
  }

  /**
   * Hook قبل از آپدیت: مدیریت payment options و visibility
   */
  private async handleBeforeUpdate(
    id: number | string,
    data: any
  ): Promise<any> {
    const {
      paymentOptions,
      visibilityByGroup,
      paymentOptionsByGroup,
      ...rest
    } = data;
    return rest;
  }

  /**
   * Hook بعد از آپدیت: به‌روزرسانی payment options و visibility
   */
  private async handleAfterUpdate(entity: any): Promise<void> {
    // این hook در update فراخوانی نمی‌شود، باید در خود متد update صدا بزنیم
  }

  /**
   * همگام‌سازی payment options و visibility
   */
  private async syncPaymentOptionsAndVisibility(
    productId: number,
    data: any
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // حذف payment options قبلی
      await tx.productPaymentOption.deleteMany({
        where: { productId },
      });

      // ایجاد payment options جدید
      if (data.paymentOptions && Array.isArray(data.paymentOptions)) {
        await tx.productPaymentOption.createMany({
          data: data.paymentOptions.map((opt: any) => ({
            productId,
            paymentMethod: opt.paymentMethod,
            isEnabled: opt.isEnabled ?? true,
          })),
        });
      }

      // حذف visibility قبلی
      await tx.productUserGroupVisibility.deleteMany({
        where: { productId },
      });

      // ایجاد visibility جدید
      if (data.visibilityByGroup && Array.isArray(data.visibilityByGroup)) {
        await tx.productUserGroupVisibility.createMany({
          data: data.visibilityByGroup.map((vis: any) => ({
            productId,
            userGroupId: vis.userGroupId,
            canView: vis.canView ?? true,
            canBuy: vis.canBuy ?? true,
          })),
        });
      }

      // حذف payment options by group قبلی
      await tx.productUserGroupPaymentOption.deleteMany({
        where: { productId },
      });

      // ایجاد payment options by group جدید
      if (
        data.paymentOptionsByGroup &&
        Array.isArray(data.paymentOptionsByGroup)
      ) {
        await tx.productUserGroupPaymentOption.createMany({
          data: data.paymentOptionsByGroup.map((opt: any) => ({
            productId,
            userGroupId: opt.userGroupId,
            paymentMethod: opt.paymentMethod,
            isEnabled: opt.isEnabled ?? true,
          })),
        });
      }
    });
  }

  /**
   * Override update method برای مدیریت payment options و visibility
   */
  async update(id: number | string, data: any): Promise<any> {
    const {
      paymentOptions,
      visibilityByGroup,
      paymentOptionsByGroup,
      ...rest
    } = data;
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    const updated = await super.update(numericId, rest);
    await this.syncPaymentOptionsAndVisibility(numericId, {
      paymentOptions,
      visibilityByGroup,
      paymentOptionsByGroup,
    });
    return updated;
  }

  /**
   * دریافت محصولات قابل نمایش در سایت عمومی
   */
  async getPublicProducts(workspaceId: number, filters?: any): Promise<any[]> {
    return prisma.product.findMany({
      where: {
        workspaceId,
        isPublicVisible: true,
        isActive: true,
        // بررسی موجودی در حداقل یک انبار
        stocks: {
          some: {
            quantity: { gt: 0 },
          },
        },
        ...filters,
      },
      include: {
        brand: true,
        category: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        stocks: {
          include: {
            warehouse: true,
          },
        },
      },
    });
  }

  /**
   * دریافت محصولات قابل نمایش در پنل مشتری (با در نظر گیری گروه کاربری)
   */
  async getCustomerPanelProducts(
    workspaceId: number,
    workspaceUserId: number,
    filters?: any
  ): Promise<any[]> {
    // دریافت گروه کاربری مشتری (فقط یک گروه)
    const workspaceUser = await prisma.workspaceUser.findUnique({
      where: { id: workspaceUserId },
      include: {
        userGroup: {
          select: { id: true },
        },
      },
    });

    const userGroupId = workspaceUser?.userGroup?.id;
    const userGroupIds = userGroupId ? [userGroupId] : [];

    return prisma.product.findMany({
      where: {
        workspaceId,
        isCustomerPanelVisible: true,
        isActive: true,
        // بررسی موجودی
        stocks: {
          some: {
            quantity: { gt: 0 },
          },
        },
        // بررسی visibility بر اساس گروه کاربری
        OR: [
          // محصولاتی که visibility خاصی ندارند (قابل مشاهده برای همه)
          {
            visibilityByGroup: {
              none: {},
            },
          },
          // محصولاتی که برای گروه‌های کاربری این مشتری قابل مشاهده هستند
          {
            visibilityByGroup: {
              some: {
                userGroupId: { in: userGroupIds },
                canView: true,
              },
            },
          },
        ],
        ...filters,
      },
      include: {
        brand: true,
        category: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        stocks: {
          include: {
            warehouse: true,
          },
        },
        visibilityByGroup: {
          where: {
            userGroupId: { in: userGroupIds },
          },
        },
        paymentOptions: true,
        paymentOptionsByGroup: {
          where: {
            userGroupId: { in: userGroupIds },
          },
        },
      },
    });
  }

  /**
   * دریافت قیمت محصول بر اساس گروه کاربری
   */
  async getProductPriceForUser(
    productId: number,
    workspaceUserId?: number
  ): Promise<any> {
    if (!workspaceUserId) {
      // اگر کاربر لاگین نکرده، قیمت پایه را برگردان
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { price: true },
      });
      return {
        basePrice: product?.price || 0,
        finalPrice: product?.price || 0,
        hasDiscount: false,
        isDiscountActive: false,
      };
    }

    // دریافت گروه کاربری
    const workspaceUser = await prisma.workspaceUser.findUnique({
      where: { id: workspaceUserId },
      select: { userGroupId: true },
    });

    if (!workspaceUser?.userGroupId) {
      // اگر گروه کاربری نداشت، قیمت پایه را برگردان
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { price: true },
      });
      return {
        basePrice: product?.price || 0,
        finalPrice: product?.price || 0,
        hasDiscount: false,
        isDiscountActive: false,
      };
    }

    // دریافت قیمت از لیست قیمت
    const priceInfo = await this.priceListService.getProductPriceForUserGroup(
      productId,
      workspaceUser.userGroupId
    );

    return priceInfo;
  }

  /**
   * دریافت محصولات با قیمت‌های گروهی
   */
  async getProductsWithPrices(
    workspaceId: number,
    workspaceUserId?: number,
    filters?: any
  ): Promise<any[]> {
    const products = workspaceUserId
      ? await this.getCustomerPanelProducts(
          workspaceId,
          workspaceUserId,
          filters
        )
      : await this.getPublicProducts(workspaceId, filters);

    // اضافه کردن قیمت برای هر محصول
    const productsWithPrices = await Promise.all(
      products.map(async (product) => {
        const priceInfo = await this.getProductPriceForUser(
          product.id,
          workspaceUserId
        );
        return {
          ...product,
          priceInfo,
        };
      })
    );

    return productsWithPrices;
  }
}
