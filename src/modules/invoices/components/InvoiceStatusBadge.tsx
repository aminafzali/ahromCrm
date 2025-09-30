import { InvoiceStatus } from "@prisma/client";

const statusStyles: Record<
  InvoiceStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "در انتظار تایید",
    className: "bg-yellow-100 text-yellow-800",
  },
  APPROVED: { label: "تایید شده", className: "bg-green-100 text-green-800" },
  CANCELED: { label: "لغو شده", className: "bg-red-100 text-red-800" },
  DRAFT: { label: "پیش‌نویس", className: "bg-gray-100 text-gray-800" },
};

export default function InvoiceStatusBadge({
  status,
}: {
  status: InvoiceStatus;
}) {
  const style = statusStyles[status] || {
    label: "نامشخص",
    className: "bg-gray-100 text-gray-800",
  };
  return (
    <span
      className={`px-2.5 py-1 text-xs font-medium rounded-full ${style.className}`}
    >
      {style.label}
    </span>
  );
}
