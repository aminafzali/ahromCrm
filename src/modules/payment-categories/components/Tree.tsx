// مسیر فایل: src/modules/payment-categories/components/Tree.tsx

import React from "react";
import { TreeNode } from "../types";

interface TreeProps {
  nodes: TreeNode[];
  renderNode: (node: TreeNode, level: number) => React.ReactNode;
}

const Tree: React.FC<TreeProps> = ({ nodes, renderNode }) => {
  const renderNodes = (nodes: TreeNode[], level = 0) => {
    return nodes.map((node) => (
      <div key={node.id}>
        {renderNode(node, level)}
        {node.children && node.children.length > 0 && (
          <div className="pl-4 border-r-2 border-gray-200">
            {renderNodes(node.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return <>{renderNodes(nodes)}</>;
};

export default Tree;
