// مسیر فایل: src/modules/workspaces/data/table.tsx

"use client";

import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";
import { WorkspaceWithDetails } from "../types";

export const columns: Column[] = [
  {
    name: "name",
    field: "name",
    label: "نام ورک‌اسپیس",
    render: (row: WorkspaceWithDetails) => (
      <Link
        href={`/dashboard/workspaces/settings/${row.id}`}
        className="font-bold text-primary hover:underline"
      >
        {row.name}
      </Link>
    ),
  },
  {
    name: "owner",
    field: "owner.name",
    label: "مالک",
    render: (row: WorkspaceWithDetails) => row.owner?.name || "نامشخص",
  },
  {
    name: "members",
    label: "تعداد اعضا",
    render: (row: WorkspaceWithDetails) => (
      <span>{row.members?.length || 0} نفر</span>
    ),
  },
  {
    name: "createdAt",
    field: "createdAt",
    label: "تاریخ ایجاد",
    render: (row: WorkspaceWithDetails) => <DateDisplay date={row.createdAt} />,
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row: WorkspaceWithDetails) => (
      <ActionsTable
        actions={["view", "edit", "delete"]}
        row={row}
        // در آینده این مسیرها را خواهیم ساخت
        onView={`/dashboard/workspaces/settings/${row.id}`}
        onEdit={`/dashboard/workspaces/edit/${row.id}`}
        showLabels
      />
    ),
  },
];
