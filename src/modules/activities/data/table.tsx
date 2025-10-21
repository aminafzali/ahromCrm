import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DIcon from "@/@Client/Components/common/DIcon";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";

export const columnsForAdmin: Column[] = [
  {
    name: "title",
    label: "عنوان",
    render: (row: any) => row.title || `#${row.id}`,
  },
  {
    name: "status",
    label: "وضعیت",
    render: (row: any) => (
      <span
        className={`px-2 py-1 rounded text-xs ${
          row.status === "NEW"
            ? "bg-blue-100 text-blue-700"
            : row.status === "OPEN"
            ? "bg-amber-100 text-amber-700"
            : row.status === "IN_PROGRESS"
            ? "bg-purple-100 text-purple-700"
            : row.status === "RESOLVED"
            ? "bg-emerald-100 text-emerald-700"
            : row.status === "CLOSED"
            ? "bg-gray-200 text-gray-700"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {statusLabel(row.status)}
      </span>
    ),
  },
  {
    name: "priority",
    label: "اولویت",
    render: (row: any) => (
      <span
        className={`px-2 py-1 rounded text-xs ${
          row.priority === "CRITICAL"
            ? "bg-red-100 text-red-700"
            : row.priority === "HIGH"
            ? "bg-orange-100 text-orange-700"
            : row.priority === "MEDIUM"
            ? "bg-amber-100 text-amber-700"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {priorityLabel(row.priority)}
      </span>
    ),
  },
  {
    name: "type",
    label: "نوع",
    render: (row: any) => typeLabel(row.type),
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row: any) => (
      <ActionsTable
        row={row}
        actions={["view", "edit", "delete"]}
        onView={`/dashboard/support-info/${row.id}`}
        onEdit={`/dashboard/support-info/${row.id}/update`}
      />
    ),
  },
];

export const columnsForUser: Column[] = [
  { name: "title", label: "عنوان", render: (row: any) => row.title },
  {
    name: "status",
    label: "وضعیت",
    render: (row: any) => statusLabel(row.status),
  },
  {
    name: "priority",
    label: "اولویت",
    render: (row: any) => priorityLabel(row.priority),
  },
  {
    name: "createdAt",
    label: "تاریخ",
    render: (row: any) => <DateDisplay date={row.createdAt} />,
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row: any) => (
      <ActionsTable
        actions={["view"]}
        row={row}
        onView={`/panel/supports/${row.id}`}
        showLabels
      />
    ),
  },
];

function statusLabel(v?: string) {
  switch (v) {
    case "NEW":
      return "جدید";
    case "OPEN":
      return "باز";
    case "IN_PROGRESS":
      return "در حال پیگیری";
    case "RESOLVED":
      return "حل شده";
    case "CLOSED":
      return "بسته";
    default:
      return v || "-";
  }
}

function priorityLabel(v?: string) {
  switch (v) {
    case "CRITICAL":
      return "بحرانی";
    case "HIGH":
      return "زیاد";
    case "MEDIUM":
      return "متوسط";
    case "LOW":
      return "کم";
    default:
      return v || "-";
  }
}

function typeLabel(v?: string) {
  switch (v) {
    case "SALES_ORDER":
      return "سفارش فروش";
    case "QUOTE":
      return "پیش‌فاکتور";
    case "ORDER_FOLLOWUP":
      return "پیگیری سفارش";
    case "PURCHASE_ORDER":
      return "سفارش خرید";
    case "PURCHASE_QUOTE":
      return "استعلام خرید";
    case "COMPLAINT":
      return "شکایت";
    case "ISSUE":
      return "ایراد";
    case "QUESTION":
      return "سؤال";
    default:
      return v || "-";
  }
}

export const listItemRender = (row: any) => (
  <div className="bg-white px-4 py-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <Link href={`/dashboard/support-info/${row.id}`}>
      <div className="flex items-center justify-between border-b pb-2">
        <span className="text-sm text-gray-500 flex items-center gap-1">
          <DIcon icon="fa-calendar" cdi={false} />
          <DateDisplay date={row.createdAt} />
        </span>
        <h3 className="font-semibold text-md">{row.title || `#${row.id}`}</h3>
      </div>

      <p className="text-gray-700 text-sm mt-2 line-clamp-3">
        {row.description || "بدون توضیحات"}
      </p>
    </Link>

    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
      <div className="flex items-center gap-2 text-gray-700">
        <DIcon icon="fa-user" cdi={false} />
        <span>
          {row.user?.displayName ||
            row.user?.user?.name ||
            row.user?.name ||
            row.workspaceUser?.displayName ||
            row.workspaceUser?.user?.name ||
            "کاربر نامشخص"}
        </span>
      </div>
      <div className="flex items-center gap-2 text-gray-700 justify-end">
        <DIcon icon="fa-layer-group" cdi={false} />
        <span>
          وابسته‌ها: وظایف {row.tasksCount ?? 0} / مستندات{" "}
          {row.documentsCount ?? 0} / دانش {row.knowledgeCount ?? 0}
        </span>
      </div>
      <div className="flex items-center gap-2 text-gray-700">
        <DIcon icon="fa-flag" cdi={false} />
        <span>{priorityLabel(row.priority)}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-700 justify-end">
        <DIcon icon="fa-circle-check" cdi={false} />
        <span>{statusLabel(row.status)}</span>
      </div>
    </div>

    <div className="flex justify-end mt-3 border-t pt-3">
      <ActionsTable
        actions={["view"]}
        row={row}
        onView={`/dashboard/support-info/${row.id}`}
        showLabels
      />
    </div>
  </div>
);
