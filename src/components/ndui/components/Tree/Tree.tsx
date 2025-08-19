import React, { useState } from 'react';

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  icon?: React.ReactNode;
}

interface TreeProps {
  nodes: TreeNode[];
  onNodeClick?: (node: TreeNode) => void;
  defaultExpanded?: string[];
}

const TreeItem: React.FC<{
  node: TreeNode;
  level: number;
  expanded: string[];
  onToggle: (id: string) => void;
  onNodeClick?: (node: TreeNode) => void;
}> = ({ node, level, expanded, onToggle, onNodeClick }) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.includes(node.id);

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-2 px-2 py-1 hover:bg-base-200 cursor-pointer"
        style={{ paddingLeft: `${level * 1.5}rem` }}
        onClick={() => {
          if (hasChildren) {
            onToggle(node.id);
          }
          onNodeClick?.(node);
        }}
      >
        {hasChildren && (
          <span className="w-4">
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
        {node.icon && <span>{node.icon}</span>}
        
        <span>{node.label}</span>
      </div>
      
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              level={level + 1}
              expanded={expanded}
              onToggle={onToggle}
              onNodeClick={onNodeClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Tree: React.FC<TreeProps> = ({
  nodes,
  onNodeClick,
  defaultExpanded = [],
}) => {
  const [expanded, setExpanded] = useState<string[]>(defaultExpanded);

  const handleToggle = (id: string) => {
    setExpanded(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="bg-base-100 rounded-lg">
      {nodes.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          level={0}
          expanded={expanded}
          onToggle={handleToggle}
          onNodeClick={onNodeClick}
        />
      ))}
    </div>
  );
};

export default Tree;