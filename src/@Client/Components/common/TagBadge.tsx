import React from "react";

interface TagBadgeProps {
  tag: string;
  tagMap?: Record<string, { label: string; color: string }>;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const defaultTagMap: Record<string, { label: string; color: string }> = {
  primary: { label: "اصلی", color: "primary" },
  accent: { label: "تاکیدی", color: "accent" },
  secondary: { label: "ثانویه", color: "secondary" },
  warning: { label: "هشدار", color: "warning" },
  success: { label: "موفقیت", color: "success" },
  neutral: { label: "خنثی", color: "neutral" },
  info: { label: "اطلاعات", color: "info" },
};

const TagBadge: React.FC<TagBadgeProps> = ({
  tag,
  tagMap = defaultTagMap,
  className = "",
  size = "md",
}) => {
  const tagInfo = tagMap[tag] || { label: tag, color: "neutral" };

  return (
    <div
      className={`badge badge-${size} badge-soft badge-${tagInfo.color}  ${className}`}
    >
      {tagInfo.label}
    </div>
  );
};

export default TagBadge;
