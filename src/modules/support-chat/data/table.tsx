import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DIcon from "@/@Client/Components/common/DIcon";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";
import PriorityBadge from "../components/ui/PriorityBadge";
import StatusBadge from "../components/ui/StatusBadge";

export const columnsForAdmin: Column[] = [
  {
    name: "ticketNumber",
    field: "ticketNumber",
    label: "شماره تیکت",
    render: (row) => (
      <span className="font-mono text-sm">{row.ticketNumber}</span>
    ),
  },
  {
    name: "subject",
    field: "subject",
    label: "موضوع",
    render: (row) => (
      <div className="max-w-md">
        <div className="font-medium text-gray-900 dark:text-white">
          {row.subject}
        </div>
        {row.description && (
          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
            {row.description}
          </div>
        )}
      </div>
    ),
  },
  {
    name: "customer",
    field: "customer",
    label: "مشتری",
    render: (row) => {
      const customerName = row.workspaceUser
        ? row.workspaceUser.displayName
        : row.guestUser
        ? row.guestUser.name
        : "کاربر ناشناس";
      return <span className="text-sm">{customerName}</span>;
    },
  },
  {
    name: "status",
    field: "status",
    label: "وضعیت",
    render: (row) => <StatusBadge status={row.status || "OPEN"} />,
  },
  {
    name: "priority",
    field: "priority",
    label: "اولویت",
    render: (row) => <PriorityBadge priority={row.priority || "MEDIUM"} />,
  },
  {
    name: "assignedTo",
    field: "assignedTo",
    label: "کارشناس",
    render: (row) => (
      <span className="text-sm">{row.assignedTo?.displayName || "-"}</span>
    ),
  },
  {
    name: "category",
    field: "category",
    label: "دسته‌بندی",
    render: (row) => (
      <span className="text-sm">{row.category?.name || "-"}</span>
    ),
  },
  {
    name: "messages",
    field: "_count.messages",
    label: "پیام‌ها",
    render: (row) => (
      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
        <DIcon icon="fa-comment" classCustom="text-xs" />
        <span>{row._count?.messages || 0}</span>
      </div>
    ),
  },
  {
    name: "createdAt",
    field: "createdAt",
    label: "تاریخ ایجاد",
    render: (row) => <DateDisplay date={row.createdAt} />,
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        actions={["view"]}
        row={row}
        onView={`/dashboard/support-chat/${row.id}`}
        showLabels
      />
    ),
  },
];

export const listItemRender = (row: any) => {
  const customerName = row.workspaceUser
    ? row.workspaceUser.displayName
    : row.guestUser
    ? row.guestUser.name
    : "کاربر ناشناس";

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500 font-mono">
              #{row.ticketNumber}
            </span>
            <StatusBadge status={row.status || "OPEN"} />
            <PriorityBadge priority={row.priority || "MEDIUM"} />
          </div>
          <h3 className="font-semibold">{row.subject}</h3>
          {row.description && (
            <p className="text-gray-600 text-sm line-clamp-2 mt-1">
              {row.description}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">
            <DIcon icon="fa-user" cdi={false} classCustom="ml-1" />
            {customerName}
          </div>
          {row.assignedTo && (
            <div className="text-xs text-gray-500 mt-1">
              کارشناس: {row.assignedTo.displayName}
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center mt-2 pt-2 border-t">
        <div className="text-sm text-gray-500">
          <DIcon icon="fa-calendar" cdi={false} classCustom="ml-1" />
          <DateDisplay date={row.createdAt} />
        </div>
        <Link href={`/dashboard/support-chat/${row.id}`}>
          <button className="btn btn-ghost btn-sm">
            <DIcon icon="fa-eye" cdi={false} classCustom="ml-2" />
            مشاهده جزئیات
          </button>
        </Link>
      </div>
    </div>
  );
};
