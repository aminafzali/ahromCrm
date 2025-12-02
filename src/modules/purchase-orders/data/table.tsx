import Link from "next/link";
import { PurchaseOrderWithRelations } from "../types";

export const columns: any[] = [
  {
    header: "شماره",
    accessorKey: "id",
    cell: (row: PurchaseOrderWithRelations) => (
      <Link
        href={`/dashboard/purchase-orders/${row.id}`}
        className="text-blue-600 hover:underline font-medium"
      >
        #{row.id}
      </Link>
    ),
  },
  {
    header: "تامین‌کننده",
    accessorKey: "supplierWorkspaceUser",
    cell: (row: PurchaseOrderWithRelations) =>
      row.supplierWorkspaceUser?.user?.name || "-",
  },
  {
    header: "وضعیت",
    accessorKey: "status",
    cell: (row: PurchaseOrderWithRelations) => {
      const statusColors: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-800",
        APPROVED: "bg-blue-100 text-blue-800",
        RECEIVED: "bg-green-100 text-green-800",
        CANCELED: "bg-red-100 text-red-800",
      };

      const statusLabels: Record<string, string> = {
        PENDING: "در انتظار",
        APPROVED: "تایید شده",
        RECEIVED: "دریافت شده",
        CANCELED: "لغو شده",
      };

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            statusColors[row.status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {statusLabels[row.status] || row.status}
        </span>
      );
    },
  },
  {
    header: "تعداد آیتم‌ها",
    accessorKey: "items",
    cell: (row: PurchaseOrderWithRelations) => row.items?.length || 0,
  },
  {
    header: "فاکتور",
    accessorKey: "linkedInvoiceId",
    cell: (row: PurchaseOrderWithRelations) =>
      row.linkedInvoiceId ? (
        <Link
          href={`/dashboard/invoices/${row.linkedInvoiceId}`}
          className="text-blue-600 hover:underline"
        >
          #{row.linkedInvoice?.invoiceNumberName}
        </Link>
      ) : (
        "-"
      ),
  },
  {
    header: "تاریخ ایجاد",
    accessorKey: "createdAt",
    cell: (row: PurchaseOrderWithRelations) =>
      new Date(row.createdAt).toLocaleDateString("fa-IR"),
  },
];

// Columns for selection (for dataTable field type)
export const columnsForSelect = columns.slice(0, 3);
