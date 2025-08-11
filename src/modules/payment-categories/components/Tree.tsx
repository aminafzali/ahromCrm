import DIcon from "@/@Client/Components/common/DIcon";
import { Button } from "ndui-ahrom";
import { useState } from "react";
import { TreeNode as TreeNodeType } from "../types";
interface TreeViewProps {
  selected?: number | null;
  data: TreeNodeType[];
  onNodeClick?: (node: TreeNodeType) => void;
  addNode?: (node: TreeNodeType) => React.ReactNode; // تبدیل به تابع
  removeNode?: (node: TreeNodeType) => React.ReactNode; // تبدیل به تابع
}

const TreeNode: React.FC<{
  node: TreeNodeType;
  selected?: number | null;
  onNodeClick?: (node: TreeNodeType) => void;
  addNode?: (node: TreeNodeType) => React.ReactNode;
  removeNode?: (node: TreeNodeType) => React.ReactNode;
}> = ({ node, onNodeClick, addNode, removeNode, selected }) => {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    if (onNodeClick) onNodeClick(node);
  };

  return (
    <div className="pr-2">
      <div
        className={`flex justify-between mt-1 border p-1 bg-white rounded-lg border items-center cursor-pointer  transition ${
          selected === node.id && "border-primary border-2"
        }`}
        onClick={handleClick}
      >
        <div className="flex items-center">
          {node.children && node.children.length > 0 && (
            <span className="ml-2 text-gray-600">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                size="sm"
                variant="ghost"
                icon={
                  <DIcon
                    icon={expanded ? "fa-caret-down" : "fa-caret-left"}
                    cdi={false}
                    classCustom="fa-solid text-2xl !mx-0"
                  />
                }
              />
            </span>
          )}
          <span className="font-medium text-gray-800">{node.name}</span>
        </div>

        <div
          className="flex gap-1 text-gray-500"
          onClick={(e) => e.stopPropagation()}
        >
          {removeNode && removeNode(node)} {/* ارسال node به تابع */}
          {addNode && addNode(node)} {/* ارسال node به تابع */}
        </div>
      </div>
      {expanded && node.children && (
        <div className="pr-4 w-full border-gray-300 mt-1">
          {node.children.map((child, index) => (
            <TreeNode
              key={index}
              node={child}
              onNodeClick={onNodeClick}
              addNode={addNode}
              removeNode={removeNode}
              selected={selected}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeView: React.FC<TreeViewProps> = ({
  data,
  onNodeClick,
  addNode,
  removeNode,
  selected,
}) => {
  return (
    <div className="w-full max-w-md">
      {data.map((node, index) => (
        <TreeNode
          key={index}
          node={node}
          onNodeClick={onNodeClick}
          addNode={addNode}
          removeNode={removeNode}
          selected={selected}
        />
      ))}
    </div>
  );
};

export default TreeView;
