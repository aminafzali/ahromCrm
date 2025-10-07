import { SupportCategory as PrismaSupportCategory, SupportTicket } from "@prisma/client";

export type SupportCategory = PrismaSupportCategory;

export type SupportCategoryWithRelations = SupportCategory & {
  parent?: SupportCategory;
  children?: SupportCategory[];
  supports?: SupportTicket[];
  _count?: {
    supports: number;
    children: number;
  };
};

export interface TreeNode extends SupportCategoryWithRelations {
  children?: TreeNode[];
}


