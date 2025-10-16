"use client";

import { SupportTicketStatus } from "@prisma/client";

interface StatusBadgeProps {
  status: SupportTicketStatus;
}

const statusConfig = {
  OPEN: {
    label: "باز",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  PENDING: {
    label: "در انتظار",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  IN_PROGRESS: {
    label: "در حال بررسی",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },
  WAITING_CUSTOMER: {
    label: "منتظر پاسخ مشتری",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  },
  RESOLVED: {
    label: "حل شده",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  CLOSED: {
    label: "بسته شده",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.OPEN;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

