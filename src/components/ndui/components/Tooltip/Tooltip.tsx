import React from "react";

interface TooltipProps {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = "top",
  children,
}) => {
  return (
    <div className={`tooltip tooltip-${position}`} data-tip={content}>
      {children}
    </div>
  );
};

export default Tooltip;