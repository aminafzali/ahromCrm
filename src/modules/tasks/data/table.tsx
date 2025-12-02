// // مسیر فایل: src/modules/tasks/data/table.tsx
import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DIcon from "@/@Client/Components/common/DIcon";
import { TaskWithRelations } from "@/modules/tasks/types";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";
import React from "react";

const stripHtml = (value?: string | null) => {
  if (!value) return "";
  return value.replace(/<[^>]+>/g, "");
};

// کامپوننت کمکی برای نمایش اولویت با رنگ‌های مختلف
export const PriorityBadge = ({ priority }: { priority: string }) => {
  const priorityStyles: { [key: string]: { label: string; color: string } } = {
    low: { label: "پایین", color: "gray" },
    medium: { label: "متوسط", color: "blue" },
    high: { label: "بالا", color: "orange" },
    urgent: { label: "فوری", color: "red" },
  };

  const style = priorityStyles[priority?.toLowerCase()] || priorityStyles.low;

  return (
    <span
      className="px-2 py-1 text-xs font-semibold rounded-full"
      style={{
        backgroundColor: `${style.color}20`,
        color: style.color,
      }}
    >
      {style.label}
    </span>
  );
};

const formatAssignment = (row: TaskWithRelations) => {
  const users =
    row.assignedUsers
      ?.map((u: any) => u.displayName || u.user?.name)
      .filter(Boolean)
      .join(", ") || "";
  const teams =
    row.assignedTeams?.map((t: any) => `تیم ${t.name}`).join(", ") || "";

  if (!users && !teams) return "---";
  return [users, teams].filter(Boolean).join(" | ");
};

type ColumnOptions = {
  onViewTask?: (task: TaskWithRelations) => void;
};

// تعریف ستون‌های جدول برای نمایش دسکتاپ
export const getColumnsForAdmin = (options: ColumnOptions = {}): Column[] => [
  {
    name: "title",
    field: "title",
    label: "عنوان وظیفه",
    render: (row: TaskWithRelations) => (
      <div className="font-semibold text-slate-800 dark:text-slate-100">
        {row.title}
      </div>
    ),
  },
  {
    name: "project",
    label: "پروژه",
    render: (row: TaskWithRelations) => row.project?.name || "---",
  },
  {
    name: "status",
    label: "وضعیت کلی",
    render: (row: TaskWithRelations) => (
      <span
        className="px-2 py-1 text-xs font-medium rounded-full"
        style={{
          backgroundColor: `${row.status?.color}20`,
          color: row.status?.color,
        }}
      >
        {row.status?.name || "---"}
      </span>
    ),
  },
  {
    name: "projectStatus",
    label: "وضعیت پروژه",
    render: (row: TaskWithRelations) =>
      row.projectStatus ? (
        <span
          className="px-2 py-1 text-xs font-medium rounded-full"
          style={{
            backgroundColor: `${row.projectStatus?.color}20`,
            color: row.projectStatus?.color,
          }}
        >
          {row.projectStatus?.name}
        </span>
      ) : (
        <span className="text-xs text-gray-500">---</span>
      ),
  },
  {
    name: "priority",
    label: "اولویت",
    render: (row: TaskWithRelations) => (
      <PriorityBadge priority={row.priority} />
    ),
  },
  {
    name: "assignedTo",
    label: "مسئولین",
    render: (row: TaskWithRelations) => formatAssignment(row),
  },
  {
    name: "startDate",
    label: "تاریخ شروع",
    render: (row: TaskWithRelations) =>
      row.startDate
        ? new Date(row.startDate).toLocaleDateString("fa-IR")
        : "---",
  },
  {
    name: "endDate",
    label: "تاریخ پایان",
    render: (row: TaskWithRelations) =>
      row.endDate ? new Date(row.endDate).toLocaleDateString("fa-IR") : "---",
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row: TaskWithRelations) => (
      <ActionsTable
        row={row}
        actions={["view", "edit", "delete"]}
        onView={options.onViewTask ? undefined : `/dashboard/tasks/${row.id}`}
        onViewAction={
          options.onViewTask ? () => options.onViewTask?.(row) : undefined
        }
        onEdit={`/dashboard/tasks/${row.id}/update`}
      />
    ),
  },
];
// ===== شروع اصلاحیه =====
// امضای تابع برای مطابقت با نیاز DataTableWrapper2 تغییر کرد
export const listItemRender = (
  item: TaskWithRelations,
  options?: ColumnOptions
): React.ReactNode => {
  const assignment = formatAssignment(item) || "---";
  const handleView = options?.onViewTask;
  const plainDescription = stripHtml(item.description).trim();
  const description =
    plainDescription.length > 200
      ? `${plainDescription.slice(0, 200)}…`
      : plainDescription;

  return (
    <div className="p-4 my-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div>
          <p className="text-xs uppercase text-gray-400">
            {item.project?.name || "بدون پروژه"}
          </p>
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            {item.title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          {handleView ? (
            <button
              type="button"
              onClick={() => handleView(item)}
              className="p-1 rounded hover:text-primary transition"
              aria-label="مشاهده"
            >
              <DIcon icon="fa-eye" className="text-[0.85rem]" />
            </button>
          ) : (
            <Link
              href={`/dashboard/tasks/${item.id}`}
              className="p-1 rounded hover:text-primary transition"
              aria-label="مشاهده"
            >
              <DIcon icon="fa-eye" className="text-[0.85rem]" />
            </Link>
          )}
          <Link
            href={`/dashboard/tasks/${item.id}/update`}
            className="p-1 rounded hover:text-primary transition"
            aria-label="ویرایش"
          >
            <DIcon icon="fa-pen-to-square" className="text-[0.85rem]" />
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3 text-xs">
        <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200">
          {item.status?.name || "وضعیت کلی نامشخص"}
        </span>
        {item.projectStatus?.name && (
          <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200">
            {item.projectStatus?.name}
          </span>
        )}
        <div className="flex items-center gap-1">
          <span className="text-gray-500">اولویت:</span>
          <PriorityBadge priority={item.priority} />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-[0.85rem] text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <DIcon icon="fa-users" />
          <span>{assignment}</span>
        </div>
        <div className="flex items-center gap-1">
          <DIcon icon="fa-calendar-alt" />
          <span>
            شروع:{" "}
            {item.startDate
              ? new Date(item.startDate).toLocaleDateString("fa-IR")
              : "---"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <DIcon icon="fa-calendar-check" />
          <span>
            پایان:{" "}
            {item.endDate
              ? new Date(item.endDate).toLocaleDateString("fa-IR")
              : "---"}
          </span>
        </div>
      </div>
    </div>
  );
};
// ===== پایان اصلاحیه =====

// import ActionsTable from "@/@Client/Components/common/ActionsTable";
// import { Column } from "ndui-ahrom/dist/components/Table/Table";

// export const columns: Column[] = [
//   {
//     name: "title",
//     field: "title",
//     label: "عنوان وظیفه",
//   },
//   {
//     name: "project",
//     label: "پروژه",
//     render: (row) => row.project?.name || "-",
//   },
//   {
//     name: "status",
//     label: "وضعیت",
//     render: (row) => (
//       <span
//         className="px-2 py-1 text-xs font-medium rounded-full"
//         style={{
//           backgroundColor: `${row.status?.color}20`,
//           color: row.status?.color,
//         }}
//       >
//         {row.status?.name || "-"}
//       </span>
//     ),
//   },
//   {
//     name: "assignedUsers",
//     label: "مسئولین",
//     render: (row) =>
//       row.assignedUsers
//         ?.map((u: any) => u.displayName || u.user.name)
//         .join(", ") || "-",
//   },
//   {
//     name: "endDate",
//     label: "تاریخ پایان",
//     render: (row) =>
//       row.endDate ? new Date(row.endDate).toLocaleDateString("fa-IR") : "-",
//   },
//   {
//     name: "actions",
//     label: "عملیات",
//     render: (row) => (
//       <ActionsTable
//         row={row}
//         actions={["view", "edit", "delete"]}
//         onView={`/dashboard/tasks/${row.id}`}
//         onEdit={`/dashboard/tasks/${row.id}/update`}
//       />
//     ),
//   },
// ];
