"use client";

import React from "react";
import { TicketPriority } from "../../types";

// Types
interface PriorityBadgeProps {
  priority: TicketPriority | undefined | null;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "solid";
  className?: string;
}

// Constants
const PRIORITY_CONFIG = {
  LOW: {
    label: "کم",
    color: "text-green-700 dark:text-green-300",
    bgColor: "bg-green-100 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
    icon: "fa-arrow-down",
  },
  MEDIUM: {
    label: "متوسط",
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    icon: "fa-minus",
  },
  HIGH: {
    label: "بالا",
    color: "text-orange-700 dark:text-orange-300",
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
    borderColor: "border-orange-200 dark:border-orange-800",
    icon: "fa-arrow-up",
  },
  URGENT: {
    label: "فوری",
    color: "text-red-700 dark:text-red-300",
    bgColor: "bg-red-100 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
    icon: "fa-exclamation-triangle",
  },
} as const;

const SIZE_CONFIG = {
  sm: {
    text: "text-xs",
    padding: "px-1.5 py-1",
    icon: "text-xs",
  },
  md: {
    text: "text-sm",
    padding: "px-2 py-1.5",
    icon: "text-sm",
  },
  lg: {
    text: "text-base",
    padding: "px-2.5 py-2",
    icon: "text-base",
  },
} as const;

const VARIANT_CONFIG = {
  default: "border",
  outline: "border-2 bg-transparent",
  solid: "border-0",
} as const;

// Main Component
const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = "md",
  variant = "default",
  className = "",
}) => {
  // Handle undefined priority
  if (!priority) {
    return null;
  }

  const config = PRIORITY_CONFIG[priority];
  const sizeConfig = SIZE_CONFIG[size];
  const variantConfig = VARIANT_CONFIG[variant];

  // Handle unknown priority
  if (!config) {
    return null;
  }

  const baseClasses =
    "inline-flex items-center gap-1.5 font-medium rounded-full transition-colors";
  const priorityClasses = `${config.color} ${config.bgColor}`;
  const borderClasses = variant === "solid" ? "" : `${config.borderColor}`;
  const sizeClasses = `${sizeConfig.text} ${sizeConfig.padding}`;
  const variantClasses = variantConfig;

  return (
    <span
      className={`${baseClasses} ${priorityClasses} ${borderClasses} ${sizeClasses} ${variantClasses} ${className}`}
      title={`اولویت: ${config.label}`}
    >
      <i className={`fas ${config.icon} ${sizeConfig.icon}`} />
      <span className="hidden sm:inline">{config.label}</span>
      <span className="sm:hidden">{config.label.charAt(0)}</span>
    </span>
  );
};

export default PriorityBadge;
export type { PriorityBadgeProps };
