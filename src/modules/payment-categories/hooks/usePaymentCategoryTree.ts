// مسیر فایل: src/modules/payment-categories/hooks/usePaymentCategoryTree.ts

import { useEffect, useState } from "react";
import { PaymentCategoryWithRelations, TreeNode } from "../types";

export function usePaymentCategoryTree(
  categories: PaymentCategoryWithRelations[]
) {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);

  useEffect(() => {
    if (categories) {
      const buildTree = (items: PaymentCategoryWithRelations[]): TreeNode[] => {
        const map = new Map<number, TreeNode>();
        const roots: TreeNode[] = [];

        items.forEach((item) => {
          map.set(item.id, { ...item, children: [] });
        });

        items.forEach((item) => {
          const node = map.get(item.id)!;
          if (item.parentId) {
            const parent = map.get(item.parentId);
            if (parent) {
              parent.children = parent.children || [];
              parent.children.push(node);
            }
          } else {
            roots.push(node);
          }
        });

        return roots;
      };

      setTreeData(buildTree(categories));
    }
  }, [categories]);

  return { treeData };
}
