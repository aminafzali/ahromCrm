// مسیر فایل: src/modules/projects/data/table.tsx

import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DIcon from "@/@Client/Components/common/DIcon";
import { ProjectWithRelations } from "@/modules/projects/types";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import React from "react";

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
// ===== Render برای حالت List/Card در موبایل (بدون تداخل با touch scroll) =====
export const listItemRender = (item: ProjectWithRelations): React.ReactNode => (
  <div className="p-4 my-2 bg-white rounded-lg shadow-md dark:bg-slate-800 touch-pan-y">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center">
        <h3 className="ml-2 text-lg font-bold text-slate-800 dark:text-slate-100">
          {item.name}
        </h3>
      </div>
      <div className="flex items-center space-x-2">
        <ActionsTable
          row={item}
          actions={["view", "edit", "delete"]}
          onView={`/dashboard/projects/${item.id}`}
          onEdit={`/dashboard/projects/${item.id}/update`}
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 text-sm">
      <div className="flex items-center">
        <DIcon icon="fa-flag" className="ml-2 text-gray-400" />
        <span className="font-semibold text-gray-600 dark:text-gray-300">
          وضعیت:
        </span>
        <span
          className="px-2 py-1 mr-2 text-xs font-medium rounded-full"
          style={{
            backgroundColor: `${item.status?.color}20`,
            color: item.status?.color,
          }}
        >
          {item.status?.name || "---"}
        </span>
      </div>

      <div className="flex items-center">
        <DIcon icon="fa-tasks" className="ml-2 text-gray-400" />
        <span className="font-semibold text-gray-600 dark:text-gray-300">
          وظایف:
        </span>
        <span className="mr-2 text-gray-700 dark:text-gray-200">
          {item._count?.tasks || 0}
        </span>
      </div>

      {item.startDate && (
        <div className="flex items-center">
          <DIcon icon="fa-calendar-alt" className="ml-2 text-gray-400" />
          <span className="font-semibold text-gray-600 dark:text-gray-300">
            شروع:
          </span>
          <span className="mr-2 text-gray-700 dark:text-gray-200">
            {new Date(item.startDate).toLocaleDateString("fa-IR")}
          </span>
        </div>
      )}

      {item.endDate && (
        <div className="flex items-center">
          <DIcon icon="fa-calendar-check" className="ml-2 text-gray-400" />
          <span className="font-semibold text-gray-600 dark:text-gray-300">
            پایان:
          </span>
          <span className="mr-2 text-gray-700 dark:text-gray-200">
            {new Date(item.endDate).toLocaleDateString("fa-IR")}
          </span>
        </div>
      )}
    </div>
  </div>
);
