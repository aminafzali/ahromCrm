import { Category, Product } from "@prisma/client";

export type CategoryWithRelations = Category & {
  parent?: Category;
  children?: Category[];
  products?: Product[];
};

export interface PaginatedCategoryResponse {
  data: CategoryWithRelations[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export interface CategoryListProps {
  isAdmin?: boolean;
  limit?: number;
}

export interface TreeNode extends CategoryWithRelations {
  children?: TreeNode[];
}