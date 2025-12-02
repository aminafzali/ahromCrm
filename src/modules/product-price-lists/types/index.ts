import { Product, UserGroup } from "@prisma/client";

/**
 * ProductPriceList type (will be available after migration)
 */
export interface ProductPriceList {
  id: number;
  productId: number;
  userGroupId: number;
  price: number;
  discountPrice: number | null;
  discountPercent: number | null;
  discountStartDate: Date | null;
  discountEndDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ProductPriceList with related data
 */
export type ProductPriceListWithRelations = ProductPriceList & {
  product?: Product;
  userGroup?: UserGroup;
};

/**
 * Price list creation input
 */
export interface ProductPriceListCreateInput {
  productId: number;
  userGroupId: number;
  price: number;
  discountPrice?: number;
  discountPercent?: number;
  discountStartDate?: Date;
  discountEndDate?: Date;
  isActive?: boolean;
}

/**
 * Price list update input
 */
export interface ProductPriceListUpdateInput {
  price?: number;
  discountPrice?: number;
  discountPercent?: number;
  discountStartDate?: Date;
  discountEndDate?: Date;
  isActive?: boolean;
}

/**
 * Active price for user group
 */
export interface ActivePrice {
  basePrice: number;
  finalPrice: number;
  discountPrice?: number;
  discountPercent?: number;
  hasDiscount: boolean;
  isDiscountActive: boolean;
}
