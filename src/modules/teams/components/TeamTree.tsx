import DIcon from "@/@Client/Components/common/DIcon";
import React, { useState } from "react";
import { TeamTreeNode } from "../hooks/useTeamTree";

interface TreeItemProps {
  node: TeamTreeNode;
  onNodeClick: (node: TeamTreeNode) => void;
  selectedId: number | null;
}

const TreeItem: React.FC<TreeItemProps> = ({
  node,
  onNodeClick,
  selectedId,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNodeClick(node);
  };

  return (
    <div className="my-1">
      <div
        className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
          isSelected
            ? "bg-primary/10 text-primary font-semibold"
            : "hover:bg-gray-100 dark:hover:bg-slate-700"
        }`}
        onClick={handleNodeClick}
      >
        <DIcon
          icon={
            hasChildren
              ? isOpen
                ? "fa-folder-open"
                : "fa-folder"
              : "fa-user-group"
          }
          className="w-1 h-1 ml-4 text-gray-500"
        />
        <span className="font-medium text-sm pt-3 mx-2">{node.name}</span>
        {hasChildren && (
          <button
            onClick={handleToggle}
            className="mr-auto text-gray-400 hover:text-gray-700"
          >
            <DIcon
              icon={isOpen ? "fa-chevron-down" : "fa-chevron-left"}
              className="w-3 h-3 pt-3 transition-transform"
            />
          </button>
        )}
      </div>
      {hasChildren && isOpen && (
        <div className="pl-4 border-r-2 border-gray-200 dark:border-slate-600 ml-2">
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              onNodeClick={onNodeClick}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface TeamTreeProps {
  data: TeamTreeNode[];
  onNodeClick: (node: TeamTreeNode) => void;
  selectedId: number | null;
}

const TeamTree: React.FC<TeamTreeProps> = ({
  data,
  onNodeClick,
  selectedId,
}) => {
  return (
    <div>
      {data.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          onNodeClick={onNodeClick}
          selectedId={selectedId}
        />
      ))}
    </div>
  );
};

export default TeamTree;
