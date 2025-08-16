// مسیر فایل: src/modules/payment-categories/types/index.ts

import {
  Payment,
  PaymentCategory as PrismaPaymentCategory,
} from "@prisma/client";

export type PaymentCategory = PrismaPaymentCategory;
// این تایپ، یک دسته‌بندی را به همراه روابطش تعریف می‌کند
export type PaymentCategoryWithRelations = PaymentCategory & {
  parent?: PaymentCategory;
  children?: PaymentCategory[];
  payments?: Payment[];
  _count?: {
    payments: number;
    children: number;
  };
};

export interface PaginatedPaymentCategoryResponse {
  data: PaymentCategoryWithRelations[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export interface PaymentCategoryListProps {
  isAdmin?: boolean;
  limit?: number;
}

// اینترفیس برای ساختار درختی در UI
export interface TreeNode extends PaymentCategoryWithRelations {
  children?: TreeNode[];
}
