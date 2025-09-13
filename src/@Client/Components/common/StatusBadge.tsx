import React from "react";

interface StatusBadgeProps {
  status: string;
  statusMap?: Record<string, { label: string; color: string }>;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const defaultStatusMap: Record<string, { label: string; color: string }> = {
  "تحویل داده شده": { label: "تحویل داده شده", color: "success" },
  APPROVED: { label: "تایید شده", color: "success" },
  active: { label: "فعال", color: "success" },
  inactive: { label: "غیرفعال", color: "error" },
  pending: { label: "در حال پردازش", color: "primary text-white" },
  PENDING: { label: "در انتظار", color: "primary text-white" },
  CASH: { label: "نقدی", color: "primary text-white" },
  processing: { label: "در حال پردازش", color: "primary text-white" },
  "در حال بررسی": { label: "در حال بررسی", color: "primary text-white" },
  "در انتظار بررسی": { label: "در انتظار بررسی", color: "primary text-white" },
  "در حال انجام": { label: "در حال انجام", color: "primary/30 text-primary" },
  TRANSFER: { label: "انتقال", color: "primary/30 text-primary" },
  completed: { label: "تکمیل شده", color: "success" },
  CARD: { label: "کارت خوان", color: "success" },
  SUCCESS: { label: "موفق", color: "success" },
  PAID: { label: "پرداخت شده", color: "success" },
  "تکمیل شده": { label: "تکمیل شده", color: "success" },
  cancelled: { label: "لغو شده", color: "error" },
  "لغو شده": { label: "لغو شده", color: "error text-white" },
  CANCELED: { label: "لغو شده", color: "error text-white" },
  COMPLETED: { label: "موفق", color: "success" },
  FAILED: { label: "ناموفق", color: "error text-white" },
  draft: { label: "پیش‌نویس", color: "secondary" },
  published: { label: "منتشر شده", color: "success" },
  archived: { label: "بایگانی شده", color: "neutral" },
  paid: { label: "پرداخت شده", color: "success" },
  unpaid: { label: "پرداخت نشده", color: "error" },
  partial: { label: "پرداخت جزئی", color: "warning" },
  "تکمیل شده(دستگاه تحویل داده شده است)": {
    label: "(دستگاه تحویل داده شده )تکمیل شده",
    color: "success",
  },
  "رد شده (دستگاه تحویل داده نشده است)": {
    label: "رد شده (دستگاه تحویل داده نشده است)",
    color: "error",
  },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  statusMap = defaultStatusMap,
  className = "",
  size = "md",
}) => {
  const statusInfo = statusMap[status] || { label: status, color: "accent" };

  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "text-xs px-1.5 py-0.5";
      case "lg":
        return "text-sm px-3 py-1";
      default:
        return "text-xs px-2 py-0.5";
    }
  };

  return (
    <span
      className={`py-1 px-4 rounded-lg bg-${statusInfo.color}  ${className}`}
    >
      {statusInfo.label}
    </span>
  );
};

export default StatusBadge;
