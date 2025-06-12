import { useEffect, useState } from 'react';
import { CategoryWithRelations, TreeNode } from '../types';



export function useCategoryTree(categories: CategoryWithRelations[]) {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);

  useEffect(() => {
    if (categories) {
      const buildTree = (items: CategoryWithRelations[]): TreeNode[] => {
        const map = new Map<number, TreeNode>();
        const roots: TreeNode[] = [];

        // First pass: Create nodes and store in map
        items.forEach(item => {
          map.set(item.id, { ...item, children: [] });
        });

        // Second pass: Build tree structure
        items.forEach(item => {
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