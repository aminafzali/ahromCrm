import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DIcon from "@/@Client/Components/common/DIcon";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";

export const columnsForAdmin: Column[] = [
  {
    name: "subject",
    label: "موضوع",
    render: (row: any) => row.subject || `#${row.id}`,
  },
  {
    name: "status",
    label: "وضعیت",
    render: (row: any) => (
      <span
        className={`px-2 py-1 rounded text-xs ${
          row.status === "OPEN"
            ? "bg-yellow-100 text-yellow-700"
            : row.status === "IN_PROGRESS"
            ? "bg-blue-100 text-blue-700"
            : row.status === "PENDING"
            ? "bg-orange-100 text-orange-700"
            : row.status === "RESOLVED"
            ? "bg-green-100 text-green-700"
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
          row.priority === "URGENT"
            ? "bg-red-100 text-red-700"
            : row.priority === "HIGH"
            ? "bg-orange-100 text-orange-700"
            : row.priority === "MEDIUM"
            ? "bg-blue-100 text-blue-700"
            : "bg-green-100 text-green-700"
        }`}
      >
        {priorityLabel(row.priority)}
      </span>
    ),
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row: any) => (
      <ActionsTable
        row={row}
        actions={["view", "edit", "delete"]}
        onView={`/dashboard/tickets/${row.id}`}
        onEdit={`/dashboard/tickets/${row.id}/update`}
      />
    ),
  },
];

export const columnsForUser: Column[] = [
  { name: "subject", label: "موضوع", render: (row: any) => row.subject },
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
        onView={`/panel/tickets/${row.id}`}
        showLabels
      />
    ),
  },
];

function statusLabel(v?: string) {
  switch (v) {
    case "OPEN":
      return "باز";
    case "IN_PROGRESS":
      return "در حال بررسی";
    case "PENDING":
      return "در انتظار";
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
    case "URGENT":
      return "فوری";
    case "HIGH":
      return "بالا";
    case "MEDIUM":
      return "متوسط";
    case "LOW":
      return "کم";
    default:
      return v || "-";
  }
}

export const listItemRender = (row: any) => (
  <div className="bg-white px-4 py-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <Link href={`/dashboard/tickets/${row.id}`}>
      <div className="flex items-center justify-between border-b pb-2">
        <span className="text-sm text-gray-500 flex items-center gap-1">
          <DIcon icon="fa-calendar" cdi={false} />
          <DateDisplay date={row.createdAt} />
        </span>
        <h3 className="font-semibold text-md">{row.subject || `#${row.id}`}</h3>
      </div>

      <p className="text-gray-700 text-sm mt-2 line-clamp-3">
        {row.description || "بدون توضیحات"}
      </p>
    </Link>

    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
      <div className="flex items-center gap-2 text-gray-700">
        <DIcon icon="fa-user" cdi={false} />
        <span>
          {row.workspaceUser?.displayName ||
            row.workspaceUser?.user?.name ||
            row.guestUser?.name ||
            "کاربر نامشخص"}
        </span>
      </div>
      <div className="flex items-center gap-2 text-gray-700 justify-end">
        <DIcon icon="fa-user-tie" cdi={false} />
        <span>
          {row.assignedTo?.displayName ||
            row.assignedTo?.user?.name ||
            "تخصیص نیافته"}
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
        onView={`/dashboard/tickets/${row.id}`}
        showLabels
      />
    </div>
  </div>
);
