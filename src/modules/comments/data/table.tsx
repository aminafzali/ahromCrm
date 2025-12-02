import { Column } from "ndui-ahrom/dist/components/Table/Table";
import React from "react";

const getEntityLabel = (row: any): string => {
  if (row.task) return `وظیفه: ${row.task.title}`;
  if (row.knowledge) return `دانش: ${row.knowledge.title}`;
  if (row.document) return `سند: ${row.document.originalName}`;
  if (row.project) return `پروژه: ${row.project.name}`;
  // Backward compatibility
  if (row.entityType && row.entityId)
    return `${row.entityType} #${row.entityId}`;
  return "نامشخص";
};

export const columnsForAdmin: Column[] = [
  { name: "body", field: "body", label: "متن" },
  {
    name: "entity",
    label: "موجودیت",
    render: (row: any) => getEntityLabel(row),
  },
  {
    name: "author",
    label: "نویسنده",
    render: (row: any) =>
      row.author?.displayName || row.author?.user?.name || "نامشخص",
  },
  {
    name: "createdAt",
    label: "تاریخ",
    render: (row: any) => new Date(row.createdAt).toLocaleString("fa-IR"),
  },
];

export const listItemRender = (row: any): React.ReactNode => (
  <div className="p-3 bg-white dark:bg-slate-800 border rounded-lg flex flex-col gap-2">
    <div className="text-xs text-slate-500">{getEntityLabel(row)}</div>
    <div className="text-sm">{row.body}</div>
    <div className="flex items-center justify-between text-[11px] text-slate-400">
      <span>
        {row.author?.displayName || row.author?.user?.name || "نامشخص"}
      </span>
      <span>{new Date(row.createdAt).toLocaleString("fa-IR")}</span>
    </div>
  </div>
);
