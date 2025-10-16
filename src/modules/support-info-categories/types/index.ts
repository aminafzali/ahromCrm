import {
  SupportInfoCategory as PrismaSupportInfoCategory,
  SupportInfo,
} from "@prisma/client";

export type SupportInfoCategory = PrismaSupportInfoCategory;

export type SupportInfoCategoryWithRelations = SupportInfoCategory & {
  parent?: SupportInfoCategory;
  children?: SupportInfoCategory[];
  supportInfo?: SupportInfo[];
  _count?: {
    supportInfo: number;
    children: number;
  };
};

export interface TreeNode extends SupportInfoCategoryWithRelations {
  children?: TreeNode[];
}
