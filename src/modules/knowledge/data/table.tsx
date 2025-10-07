import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DIcon from "@/@Client/Components/common/DIcon";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";
import React from "react";

export const columnsForAdmin: Column[] = [
  {
    name: "title",
    field: "title",
    label: "عنوان",
  },
  {
    name: "slug",
    field: "slug",
    label: "اسلاگ",
  },
  {
    name: "status",
    field: "status",
    label: "وضعیت",
  },
  {
    name: "category",
    field: "category.name",
    label: "دسته",
    render: (row: any) => row.category?.name || "-",
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row: any) => (
      <ActionsTable
        row={row}
        actions={["view", "edit", "delete"]}
        onView={`/dashboard/knowledge/${row.id}`}
        onEdit={`/dashboard/knowledge/${row.id}/update`}
      />
    ),
  },
];

export const listItemRender = (item: any): React.ReactNode => {
  const createdLabel = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString("fa-IR")
    : "—";
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 dark:bg-slate-800 p-4 md:p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex items-center gap-2">
          <DIcon icon="fa-book" cdi={false} classCustom="text-teal-600" />
          <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 line-clamp-2">
            {item.title}
          </h3>
        </div>
        <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <DIcon icon="fa-calendar" cdi={false} />
          <span>{createdLabel}</span>
        </div>
      </div>

      {/* Meta */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        <span>دسته: </span>
        <span className="font-medium">
          {item.category?.name || "بدون دسته"}
        </span>
      </div>

      <div className="border-t border-dashed border-gray-200 dark:border-slate-700" />

      {/* Content preview */}
      <div className="prose prose-sm md:prose max-w-none text-justify rtl leading-7 overflow-hidden relative">
        {item.excerpt ? (
          <p className="line-clamp-4 md:line-clamp-5">{item.excerpt}</p>
        ) : (
          <div
            className="line-clamp-4 md:line-clamp-6"
            dangerouslySetInnerHTML={{ __html: item.content || "" }}
          />
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <DIcon icon="fa-eye" cdi={false} />
          <span>مشاهده جزئیات</span>
        </div>
        <Link
          href={`/dashboard/knowledge/${item.id}`}
          className="btn btn-primary btn-sm"
        >
          <DIcon icon="fa-arrow-left" cdi={false} classCustom="ml-2" />
          جزئیات
        </Link>
      </div>
    </div>
  );
};
