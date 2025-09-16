// مسیر فایل: src/modules/tasks/data/table.tsx

import ActionsTable from "@/@Client/Components/common/ActionsTable";
import { Column } from "ndui-ahrom/dist/components/Table/Table";

export const columns: Column[] = [
  {
    name: "title",
    field: "title",
    label: "عنوان وظیفه",
  },
  {
    name: "project",
    label: "پروژه",
    render: (row) => row.project?.name || "-",
  },
  {
    name: "status",
    label: "وضعیت",
    render: (row) => (
      <span
        className="px-2 py-1 text-xs font-medium rounded-full"
        style={{
          backgroundColor: `${row.status?.color}20`,
          color: row.status?.color,
        }}
      >
        {row.status?.name || "-"}
      </span>
    ),
  },
  {
    name: "assignedUsers",
    label: "مسئولین",
    render: (row) =>
      row.assignedUsers
        ?.map((u: any) => u.displayName || u.user.name)
        .join(", ") || "-",
  },
  {
    name: "endDate",
    label: "تاریخ پایان",
    render: (row) =>
      row.endDate ? new Date(row.endDate).toLocaleDateString("fa-IR") : "-",
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        row={row}
        actions={["view", "edit", "delete"]}
        onView={`/dashboard/tasks/${row.id}`}
        onEdit={`/dashboard/tasks/${row.id}/update`}
      />
    ),
  },
];
