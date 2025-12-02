import { Product, ProductVariant } from "@prisma/client";

/**
 * ProductVariant with related data
 */
export type ProductVariantWithRelations = ProductVariant & {
  product?: Product;
};

/**
 * Variant attributes type
 */
export interface VariantAttributes {
  [key: string]: string | number;
}

/**
 * Variant creation input
 */
export interface ProductVariantCreateInput {
  productId: number;
  name?: string;
  sku?: string;
  price: number;
  stock?: number;
  attributes: VariantAttributes;
  images?: string[];
  isActive?: boolean;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
}

/**
 * Variant update input
 */
export interface ProductVariantUpdateInput {
  name?: string;
  sku?: string;
  price?: number;
  stock?: number;
  attributes?: VariantAttributes;
  images?: string[];
  isActive?: boolean;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
}
