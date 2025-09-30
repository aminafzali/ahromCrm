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
