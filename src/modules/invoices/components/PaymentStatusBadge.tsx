import { InvoicePaymentStatus } from "@prisma/client";

const statusStyles: Record<
  InvoicePaymentStatus,
  { label: string; className: string }
> = {
  UNPAID: { label: "پرداخت نشده", className: "bg-red-100 text-red-800" },
  PARTIALLY_PAID: {
    label: "پرداخت ناقص",
    className: "bg-orange-100 text-orange-800",
  },
  PAID: { label: "پرداخت کامل", className: "bg-green-100 text-green-800" },
  OVERPAID: { label: "پرداخت مازاد", className: "bg-blue-100 text-blue-800" },
};

export default function PaymentStatusBadge({
  status,
}: {
  status: InvoicePaymentStatus;
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
