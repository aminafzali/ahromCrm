"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { SupportPriority } from "@prisma/client";

interface PriorityBadgeProps {
  priority: SupportPriority;
}

const priorityConfig = {
  LOW: {
    label: "کم",
    icon: "fa-arrow-down",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  MEDIUM: {
    label: "متوسط",
    icon: "fa-minus",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  HIGH: {
    label: "زیاد",
    icon: "fa-arrow-up",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  },
  CRITICAL: {
    label: "بحرانی",
    icon: "fa-exclamation-triangle",
    className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  },
};

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority] || priorityConfig.MEDIUM;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${config.className}`}
    >
      <DIcon icon={config.icon} classCustom="text-xs" />
      {config.label}
    </span>
  );
}
