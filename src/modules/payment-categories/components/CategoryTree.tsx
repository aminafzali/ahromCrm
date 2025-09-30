// مسیر فایل: src/modules/payment-categories/components/CategoryTree.tsx

"use client";

import { useState } from "react";
import { PaymentCategoryWithRelations as TreeNodeType } from "../types";

// --- Type Definitions ---
interface CategoryTreeProps {
  data: TreeNodeType[];
  selectedId?: number | null;
  onNodeClick: (node: TreeNodeType) => void;
}

interface TreeNodeProps {
  node: TreeNodeType;
  level: number;
  selectedId?: number | null;
  onNodeClick: (node: TreeNodeType) => void;
  openNodes: Record<number, boolean>;
  toggleNode: (id: number) => void;
}

// --- SVG Icon ---
const ChevronLeftIcon = ({ isExpanded }: { isExpanded: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={3}
    stroke="currentColor"
    className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
      isExpanded ? "rotate-90" : "rotate-0"
    }`}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 19.5 8.25 12l7.5-7.5"
    />
  </svg>
);

// --- TreeNode Component ---
const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  level,
  selectedId,
  onNodeClick,
  openNodes,
  toggleNode,
}) => {
  const isParent = node.children && node.children.length > 0;
  const isExpanded = openNodes[node.id] || false;
  const isSelected = selectedId === node.id;

  return (
    <>
      <div
        onClick={() => onNodeClick(node)}
        style={{ paddingRight: `${level * 2}rem` }}
        // ===== شروع اصلاحیه: افزایش padding راست از pr-1 به pr-3 =====
        className={`flex items-center text-right w-full pl-2 pr-3 py-2.5 text-sm rounded-lg cursor-pointer transition-all duration-150
                    border-r-4 ${
                      isSelected
                        ? "bg-teal-50 dark:bg-teal-900/40 border-teal-500"
                        : "border-transparent text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                    }`}
        // ===== پایان اصلاحیه =====
      >
        {/* Node Name */}
        <span
          className={`flex-grow px-2 truncate ${
            isSelected ? "font-semibold text-teal-800 dark:text-teal-100" : ""
          }`}
        >
          {node.name}
        </span>

        {/* Icon container */}
        <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 ml-2">
          {isParent && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="p-1 rounded-full transition-colors hover:bg-slate-200 dark:hover:bg-slate-600/50"
            >
              <ChevronLeftIcon isExpanded={isExpanded} />
            </button>
          )}
        </div>
      </div>

      {isParent && isExpanded && (
        <div className="space-y-1 mt-1">
          {node.children?.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onNodeClick={onNodeClick}
              openNodes={openNodes}
              toggleNode={toggleNode}
            />
          ))}
        </div>
      )}
    </>
  );
};

// --- Main Tree Component ---
const CategoryTree: React.FC<CategoryTreeProps> = ({
  data,
  selectedId,
  onNodeClick,
}) => {
  const [openNodes, setOpenNodes] = useState<Record<number, boolean>>({});

  const toggleNode = (id: number) => {
    setOpenNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-full space-y-1">
      {data.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          level={0}
          selectedId={selectedId}
          onNodeClick={onNodeClick}
          openNodes={openNodes}
          toggleNode={toggleNode}
        />
      ))}
    </div>
  );
};

export default CategoryTree;
