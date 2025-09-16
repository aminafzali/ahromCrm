// مسیر فایل: src/modules/projects/data/table.tsx

import ActionsTable from "@/@Client/Components/common/ActionsTable";
import { Column } from "ndui-ahrom/dist/components/Table/Table";

export const columns: Column[] = [
  {
    name: "name",
    field: "name",
    label: "نام پروژه",
  },
  {
    name: "status",
    label: "وضعیت",
    render: (row) => (
      <span
        className="px-2 py-1 text-xs font-medium rounded-full"
        style={{
          backgroundColor: `${row.status?.color}20`, // Add alpha for background
          color: row.status?.color,
        }}
      >
        {row.status?.name || "-"}
      </span>
    ),
  },
  {
    name: "tasksCount",
    label: "تعداد وظایف",
    render: (row) => row._count?.tasks || 0,
  },
  {
    name: "startDate",
    label: "تاریخ شروع",
    render: (row) =>
      row.startDate ? new Date(row.startDate).toLocaleDateString("fa-IR") : "-",
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
        onView={`/dashboard/projects/${row.id}`}
        onEdit={`/dashboard/projects/${row.id}/update`}
      />
    ),
  },
];
