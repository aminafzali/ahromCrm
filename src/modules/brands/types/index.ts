import { Brand as PrismaBrand, Product } from "@prisma/client";

export type Brand = PrismaBrand;

export type BrandWithRelations = Brand & {
  products?: Product[];
};

export interface PaginatedBrandResponse {
  data: BrandWithRelations[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export interface BrandListProps {
  isAdmin?: boolean;
  limit?: number;
}
