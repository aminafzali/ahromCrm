import { Brand, Category, Product, ProductAttribute, ProductImage, ProductVariant } from "@prisma/client";

export type ProductWithRelations = Product & {
  brand?: Brand;
  category?: Category;
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
  images?: ProductImage[];
};

export interface PaginatedProductResponse {
  data: ProductWithRelations[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export interface ProductListProps {
  isAdmin?: boolean;
  limit?: number;
}
