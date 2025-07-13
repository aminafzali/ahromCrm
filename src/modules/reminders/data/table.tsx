// src/modules/reminders/data/table.tsx

"use client";

import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DIcon from "@/@Client/Components/common/DIcon";
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

export const columnsForAdmin: Column[] = [
  { name: "title", field: "title", label: "عنوان" },
  {
    name: "user",
    field: "user.name",
    label: "کاربر",
    render: (row) => row.user?.name || row.user?.phone || "نامشخص",
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
    render: (row) => <ActionsTable actions={["delete"]} row={row} />,
  },
];

export const columnsForUser: Column[] = columnsForAdmin;

export const listItemRender = (row: ReminderWithDetails) => (
  <div className="bg-white px-3 py-3 border rounded-lg hover:shadow-sm transition-shadow">
    <div className="flex justify-between items-center border-b pb-2 mb-2">
      <StatusBadge status={row.status} />
      <span className="text-sm text-gray-500">
        <DIcon icon="fa-bell" cdi={false} classCustom="ml-1" />
        <DateDisplay date={row.dueDate} />
      </span>
    </div>
    <h3 className="font-bold text-md my-2">{row.title}</h3>
    {row.description && (
      <p className="text-gray-600 text-sm mt-1 mb-3">{row.description}</p>
    )}
    <div className="text-xs text-gray-500 flex justify-between items-center border-t pt-2">
      <span>مربوط به: {renderEntityLink(row)}</span>
      <span>کاربر: {row.user?.name || row.user?.phone}</span>
    </div>
    <div className="flex justify-end items-center mt-3 w-full">
      <ActionsTable actions={["delete"]} row={row} />
    </div>
  </div>
);

export const listItemRenderUser = listItemRender;
