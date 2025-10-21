"use client";

import React from "react";
import { SupportTicketStatus } from "../../types";

// Types
interface StatusBadgeProps {
  status: SupportTicketStatus | undefined | null;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "solid";
  className?: string;
}

// Constants
const STATUS_CONFIG = {
  OPEN: {
    label: "باز",
    color: "text-yellow-700 dark:text-yellow-300",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
  },
  IN_PROGRESS: {
    label: "در حال بررسی",
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  PENDING: {
    label: "در انتظار",
    color: "text-orange-700 dark:text-orange-300",
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
    borderColor: "border-orange-200 dark:border-orange-800",
  },
  RESOLVED: {
    label: "حل شده",
    color: "text-green-700 dark:text-green-300",
    bgColor: "bg-green-100 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
  },
  CLOSED: {
    label: "بسته شده",
    color: "text-gray-700 dark:text-gray-300",
    bgColor: "bg-gray-100 dark:bg-gray-900/20",
    borderColor: "border-gray-200 dark:border-gray-800",
  },
} as const;

const SIZE_CONFIG = {
  sm: {
    text: "text-xs",
    padding: "px-2 py-1",
    icon: "text-xs",
  },
  md: {
    text: "text-sm",
    padding: "px-2.5 py-1.5",
    icon: "text-sm",
  },
  lg: {
    text: "text-base",
    padding: "px-3 py-2",
    icon: "text-base",
  },
} as const;

const VARIANT_CONFIG = {
  default: "border",
  outline: "border-2 bg-transparent",
  solid: "border-0",
} as const;

// Helper Functions
const getStatusIcon = (status: SupportTicketStatus): string => {
  const iconMap = {
    OPEN: "fa-folder-open",
    IN_PROGRESS: "fa-spinner",
    PENDING: "fa-clock",
    RESOLVED: "fa-check-circle",
    CLOSED: "fa-times-circle",
  };
  return iconMap[status];
};

// Main Component
const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
  variant = "default",
  className = "",
}) => {
  // Handle undefined status
  if (!status) {
    return null;
  }

  const config = STATUS_CONFIG[status];
  const sizeConfig = SIZE_CONFIG[size];
  const variantConfig = VARIANT_CONFIG[variant];

  // Handle unknown status
  if (!config) {
    return null;
  }

  const baseClasses =
    "inline-flex items-center gap-1.5 font-medium rounded-full transition-colors";
  const statusClasses = `${config.color} ${config.bgColor}`;
  const borderClasses = variant === "solid" ? "" : `${config.borderColor}`;
  const sizeClasses = `${sizeConfig.text} ${sizeConfig.padding}`;
  const variantClasses = variantConfig;

  return (
    <span
      className={`${baseClasses} ${statusClasses} ${borderClasses} ${sizeClasses} ${variantClasses} ${className}`}
      title={`وضعیت: ${config.label}`}
    >
      <i className={`fas ${getStatusIcon(status)} ${sizeConfig.icon}`} />
      <span className="hidden sm:inline">{config.label}</span>
      <span className="sm:hidden">{config.label.charAt(0)}</span>
    </span>
  );
};

export default StatusBadge;
export type { StatusBadgeProps };
