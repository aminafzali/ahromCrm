import React from "react";

interface BadgeProps {
  variant?: "primary" | "secondary" | "accent" | "ghost" | "info" | "success" | "warning" | "error";
  size?: "xs" | "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  variant = "primary",
  size = "md",
  children,
  className = "",
}) => {
  const sizeClass = {
    xs: "badge-xs",
    sm: "badge-sm",
    md: "",
    lg: "badge-lg",
  }[size];

  return (
    <div className={`badge badge-${variant} ${sizeClass} ${className}`}>
      {children}
    </div>
  );
};

export default Badge;