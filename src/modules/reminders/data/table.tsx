// مسیر فایل: src/modules/reminders/data/table.tsx
"use client";
import ActionsTable from "@/@Client/Components/common/ActionsTable";
import StatusBadge from "@/@Client/Components/common/StatusBadge";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";
import { ReminderWithDetails } from "../types";

const renderEntityLink = (row: ReminderWithDetails) => {
  if (!row.entityType || !row.entityId)
    return <span className="text-gray-400">-</span>;
  const entityNameMap: Record<string, string> = {
    Request: "درخواست",
    Invoice: "فاکتور",
  };
  const name = entityNameMap[row.entityType] || row.entityType;
  const path = `/dashboard/${row.entityType.toLowerCase()}s/${row.entityId}`;
  return (
    <Link
      href={path}
      className="text-blue-600 hover:underline"
    >{`${name} #${row.entityId}`}</Link>
  );
};

export const columns: Column[] = [
  { name: "title", field: "title", label: "عنوان" },
  {
    name: "workspaceUser",
    field: "workspaceUser.displayName",
    label: "کاربر",
    render: (row) =>
      row.workspaceUser?.displayName || row.workspaceUser?.phone || "نامشخص",
  },
  {
    name: "relatedTo",
    label: "مربوط به",
    render: (row) => renderEntityLink(row),
  },
  {
    name: "dueDate",
    field: "dueDate",
    label: "زمان ارسال",
    render: (row) => <DateDisplay date={row.dueDate} />,
  },
  {
    name: "status",
    field: "status",
    label: "وضعیت",
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        actions={["view", "delete"]}
        row={row}
        onView={`/dashboard/reminders/${row.id}`}
        showLabels
      />
    ),
  },
];
