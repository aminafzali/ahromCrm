"use client";

interface PurchaseOrderStatusBadgeProps {
  status: string;
}

export default function PurchaseOrderStatusBadge({
  status,
}: PurchaseOrderStatusBadgeProps) {
  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
    APPROVED: "bg-blue-100 text-blue-800 border-blue-300",
    RECEIVED: "bg-green-100 text-green-800 border-green-300",
    CANCELED: "bg-red-100 text-red-800 border-red-300",
  };

  const statusLabels: Record<string, string> = {
    PENDING: "در انتظار",
    APPROVED: "تایید شده",
    RECEIVED: "دریافت شده",
    CANCELED: "لغو شده",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium border ${
        statusColors[status] || "bg-gray-100 text-gray-800 border-gray-300"
      }`}
    >
      {statusLabels[status] || status}
    </span>
  );
}

