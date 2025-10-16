import { Column } from "ndui-ahrom/dist/components/Table/Table";
import React from "react";

export const columnsForAdmin: Column[] = [
  { name: "body", field: "body", label: "متن" },
  {
    name: "entity",
    label: "موجودیت",
    render: (row: any) => `${row.entityType} #${row.entityId}`,
  },
  {
    name: "createdAt",
    label: "تاریخ",
    render: (row: any) => new Date(row.createdAt).toLocaleString("fa-IR"),
  },
];

export const listItemRender = (row: any): React.ReactNode => (
  <div className="p-3 bg-white dark:bg-slate-800 border rounded-lg flex flex-col gap-2">
    <div className="text-xs text-slate-500">
      {row.entityType} #{row.entityId}
    </div>
    <div className="text-sm">{row.body}</div>
    <div className="text-[11px] text-slate-400">
      {new Date(row.createdAt).toLocaleString("fa-IR")}
    </div>
  </div>
);
