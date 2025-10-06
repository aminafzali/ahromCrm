// مسیر فایل: src/modules/document-categories/components/TreeList.tsx
"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { useState } from "react";

type Category = {
  id: number;
  name: string;
  children?: Category[];
};

function Node({
  item,
  level = 0,
  openNodes,
  toggleNode,
  selectedId,
  onNodeClick,
}: {
  item: Category;
  level?: number;
  openNodes: Record<number, boolean>;
  toggleNode: (id: number) => void;
  selectedId?: number | null;
  onNodeClick?: (node: Category) => void;
}) {
  const hasChildren = !!item.children?.length;
  const isOpen = !!openNodes[item.id];
  const isSelected = selectedId === item.id;
  return (
    <li className="py-1">
      <div
        style={{ paddingInlineStart: level * 12 }}
        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
          isSelected
            ? "bg-teal-50 border-r-4 border-teal-500"
            : "hover:bg-slate-100"
        }`}
        onClick={() => onNodeClick?.(item)}
      >
        <div className="flex items-center">
          <DIcon
            icon={
              hasChildren
                ? isOpen
                  ? "fa-folder-open"
                  : "fa-folder"
                : "fa-folder"
            }
            cdi={false}
            classCustom="ml-2 text-slate-500"
          />
          <span>{item.name}</span>
        </div>
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleNode(item.id);
            }}
            className="btn btn-ghost btn-xs"
          >
            <DIcon
              icon={isOpen ? "fa-caret-down" : "fa-caret-left"}
              cdi={false}
              classCustom="!mx-0"
            />
          </button>
        )}
      </div>
      {hasChildren && isOpen && (
        <ul className="pr-4">
          {item.children?.map((ch) => (
            <Node
              key={ch.id}
              item={ch}
              level={level + 1}
              openNodes={openNodes}
              toggleNode={toggleNode}
              selectedId={selectedId}
              onNodeClick={onNodeClick}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function TreeList({
  items,
  selectedId,
  onNodeClick,
}: {
  items: Category[];
  selectedId?: number | null;
  onNodeClick?: (node: Category) => void;
}) {
  const [openNodes, setOpenNodes] = useState<Record<number, boolean>>({});
  const toggleNode = (id: number) =>
    setOpenNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  return (
    <ul className="pr-1">
      {items.map((c) => (
        <Node
          key={c.id}
          item={c}
          level={0}
          openNodes={openNodes}
          toggleNode={toggleNode}
          selectedId={selectedId}
          onNodeClick={onNodeClick}
        />
      ))}
    </ul>
  );
}
