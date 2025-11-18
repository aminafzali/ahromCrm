// مسیر فایل: src/modules/pm-statuses/data/table.tsx

import ActionsTable from "@/@Client/Components/common/ActionsTable";
import { Column } from "ndui-ahrom/dist/components/Table/Table";

export const columns: Column[] = [
  {
    name: "name",
    field: "name",
    label: "نام وضعیت",
  },
  {
    name: "type",
    field: "type",
    label: "نوع",
    render: (row) => (row.type === "PROJECT" ? "پروژه" : "وظیفه"),
  },
  {
    name: "project",
    label: "پروژه",
    render: (row) =>
      row.project ? (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {row.project.name} (خاص)
        </span>
      ) : (
        <span className="text-sm text-gray-500 dark:text-gray-500">کلی</span>
      ),
  },
  {
    name: "color",
    label: "رنگ",
    render: (row) => (
      <div
        className="w-6 h-6 rounded-full"
        style={{ backgroundColor: row.color }}
      ></div>
    ),
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        row={row}
        actions={["edit", "delete"]}
        onEdit={`/dashboard/pm-statuses/${row.id}/update`}
      />
    ),
  },
];

export const columnsForSelect: Column[] = [
  {
    name: "name",
    field: "name",
    label: "نام وضعیت",
  },
  {
    name: "type",
    field: "type",
    label: "نوع",
    render: (row) => (row.type === "PROJECT" ? "پروژه" : "وظیفه"),
  },
];
