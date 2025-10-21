import { Activity, ActivityCategory as ActivityCategoryPrisma } from "@prisma/client";

export type ActivityCategory = ActivityCategoryPrisma;

export type ActivityCategoryWithRelations = ActivityCategory & {
  parent?: ActivityCategory;
  children?: ActivityCategory[];
  activities?: Activity[];
  _count?: {
    activities: number;
    children: number;
  };
};

export interface TreeNode extends ActivityCategoryWithRelations {
  children?: TreeNode[];
}
