// // مسیر فایل: src/modules/tasks/data/table.tsx
import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DIcon from "@/@Client/Components/common/DIcon";
import { TaskWithRelations } from "@/modules/tasks/types";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import React from "react";

// کامپوننت کمکی برای نمایش اولویت با رنگ‌های مختلف
export const PriorityBadge = ({ priority }: { priority: string }) => {
  const priorityStyles: { [key: string]: { label: string; color: string } } = {
    low: { label: "پایین", color: "gray" },
    medium: { label: "متوسط", color: "blue" },
    high: { label: "بالا", color: "orange" },
    urgent: { label: "فوری", color: "red" },
  };

  const style = priorityStyles[priority.toLowerCase()] || priorityStyles.low;

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

// تعریف ستون‌های جدول برای نمایش دسکتاپ
export const columnsForAdmin: Column[] = [
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
    label: "وضعیت",
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
    name: "priority",
    label: "اولویت",
    render: (row: TaskWithRelations) => (
      <PriorityBadge priority={row.priority} />
    ),
  },
  {
    name: "assignedTo",
    label: "مسئولین",
    render: (row: TaskWithRelations) => {
      const users =
        row.assignedUsers
          ?.map((u: any) => u.displayName || u.user?.name)
          .join(", ") || "";
      const teams =
        row.assignedTeams?.map((t: any) => `تیم ${t.name}`).join(", ") || "";

      if (!users && !teams) return "---";
      return [users, teams].filter(Boolean).join(" | ");
    },
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
        //endpoint="tasks" // افزودن endpoint برای سهولت در مدیریت عملیات
        onView={`/dashboard/tasks/${row.id}`}
        onEdit={`/dashboard/tasks/${row.id}/update`}
      />
    ),
  },
];
// ===== شروع اصلاحیه =====
// امضای تابع برای مطابقت با نیاز DataTableWrapper2 تغییر کرد
export const listItemRender = (item: TaskWithRelations): React.ReactNode => (
  <div className="p-4 my-2 bg-white rounded-lg shadow-md dark:bg-slate-800">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center">
        <h3 className="ml-2 text-lg font-bold text-slate-800 dark:text-slate-100">
          {item.title}
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          ({item.project?.name || "بدون پروژه"})
        </span>
      </div>
      <div className="flex items-center space-x-2">
        {/*
          کامپوننت ActionsTable خودش عملیات‌ها را مدیریت می‌کند
          و نیازی به پاس دادن توابع onView, onEdit, onDelete از اینجا نیست.
          مانند ستون‌ها، از URL ها برای لینک‌دهی استفاده می‌کنیم.
        */}
        <ActionsTable
          row={item}
          actions={["view", "edit", "delete"]}
         // endpoint="tasks"
          onView={`/dashboard/tasks/${item.id}`}
          onEdit={`/dashboard/tasks/${item.id}/update`}
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
        <DIcon icon="fa-exclamation-circle" className="ml-2 text-gray-400" />
        <span className="font-semibold text-gray-600 dark:text-gray-300">
          اولویت:
        </span>
        <div className="mr-2">
          <PriorityBadge priority={item.priority} />
        </div>
      </div>

      <div className="flex items-center col-span-2">
        <DIcon icon="fa-users" className="ml-2 text-gray-400" />
        <span className="font-semibold text-gray-600 dark:text-gray-300">
          مسئولین:
        </span>
        <span className="mr-2 text-gray-700 dark:text-gray-200">
          {columnsForAdmin
            .find((c) => c.name === "assignedTo")
            ?.render?.(item) || "---"}
        </span>
      </div>

      <div className="flex items-center">
        <DIcon icon="fa-calendar-alt" className="ml-2 text-gray-400" />
        <span className="font-semibold text-gray-600 dark:text-gray-300">
          شروع:
        </span>
        <span className="mr-2 text-gray-700 dark:text-gray-200">
          {item.startDate
            ? new Date(item.startDate).toLocaleDateString("fa-IR")
            : "---"}
        </span>
      </div>

      <div className="flex items-center">
        <DIcon icon="fa-calendar-check" className="ml-2 text-gray-400" />
        <span className="font-semibold text-gray-600 dark:text-gray-300">
          پایان:
        </span>
        <span className="mr-2 text-gray-700 dark:text-gray-200">
          {item.endDate
            ? new Date(item.endDate).toLocaleDateString("fa-IR")
            : "---"}
        </span>
      </div>
    </div>
  </div>
);
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
