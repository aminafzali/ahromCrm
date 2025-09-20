import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DIcon from "@/@Client/Components/common/DIcon";
import { TeamWithRelations } from "@/modules/teams/types";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";
import { useState } from "react";

// ===== شروع کد جدید: ستون‌ها برای جدول انتخاب تیم =====
export const columnsForSelect: Column[] = [
  {
    name: "name",
    label: "نام تیم",
  },
  {
    name: "description",
    label: "توضیحات",
  },
];
// ===== پایان کد جدید =====

export const columnsForAdmin: Column[] = [
  {
    name: "name",
    label: "نام تیم",
    render: (row: TeamWithRelations) => (
      <Link
        href={`/dashboard/teams/${row.id}`}
        className="font-semibold text-teal-800 hover:underline"
      >
        {row.name}
      </Link>
    ),
  },
  {
    name: "members",
    label: "تعداد اعضا",
    render: (row: TeamWithRelations) => `${row._count?.members || 0} نفر`,
  },
  {
    name: "projects",
    label: "پروژه‌ها",
    render: (row: TeamWithRelations) =>
      `${row._count?.assignedProjects || 0} پروژه`,
  },
  {
    name: "tasks",
    label: "وظایف",
    render: (row: TeamWithRelations) =>
      `${row._count?.assignedTasks || 0} وظیفه`,
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row: TeamWithRelations) => (
      <ActionsTable
        row={row}
        //       endpoint="teams"
        actions={["view", "edit", "delete"]}
        onView={`/dashboard/teams/${row.id}`}
        onEdit={`/dashboard/teams/${row.id}/update`}
      />
    ),
  },
];

// export const listItemRender = (row: TeamWithRelations) => (
//   <div className="p-4 my-2 bg-white rounded-lg shadow-md dark:bg-slate-800 flex items-center justify-between">
//     <div className="flex items-center">
//       <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
//         <DIcon icon="fa-users" className="text-blue-600 dark:text-blue-300" />
//       </div>
//       <div className="mr-4">
//         <Link
//           href={`/dashboard/teams/${row.id}`}
//           className="font-bold text-lg text-slate-800 dark:text-slate-100 hover:underline"
//         >
//           {row.name}
//         </Link>
//         <p className="text-sm text-gray-500 dark:text-gray-400">
//           {row.description || "بدون توضیحات"}
//         </p>
//       </div>
//     </div>
//     <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
//       <div className="text-center">
//         <div className="font-semibold">{row._count?.members || 0}</div>
//         <div>اعضا</div>
//       </div>
//       <div className="text-center">
//         <div className="font-semibold">{row._count?.assignedProjects || 0}</div>
//         <div>پروژه‌ها</div>
//       </div>
//       <ActionsTable
//         row={row}
//         //   endpoint="teams"
//         actions={["view", "edit", "delete"]}
//         onView={`/dashboard/teams/${row.id}`}
//         onEdit={`/dashboard/teams/${row.id}/update`}
//       />
//     </div>
//   </div>
// );

// ===== کامپوننت جدید برای نمایش توضیحات با قابلیت باز و بسته شدن =====
const ExpandableDescription = ({
  text,
}: {
  text: string | null | undefined;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const fullText = text || "بدون توضیحات";
  const isTruncatable = fullText.length > 100; // متنی که بیشتر از ۱۰۰ کاراکتر باشد خلاصه‌سازی می‌شود

  // اگر متن کوتاه است یا وجود ندارد، آن را به صورت عادی نمایش بده
  if (!isTruncatable) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">{fullText}</p>
    );
  }

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className="cursor-pointer"
      title="برای نمایش کامل کلیک کنید"
    >
      <p
        className={`text-sm text-gray-500 dark:text-gray-400 transition-all ${
          !isExpanded ? "truncate" : ""
        }`}
      >
        {fullText}
      </p>
      <span className="text-xs font-semibold text-teal-600 hover:underline">
        {isExpanded ? "نمایش کمتر" : "... نمایش بیشتر"}
      </span>
    </div>
  );
};

// ===== تابع رندر برای نمای لیستی/کارتی با ظاهر جدید =====
export const listItemRender = (row: TeamWithRelations) => (
  <div className="p-4 my-2 bg-white rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 flex flex-col gap-3">
    {/* بخش بالایی: آیکون، عنوان و توضیحات */}
    <div className="flex items-center w-full">
      <div className="p-3 bg-teal-100 dark:bg-teal-900/50 rounded-lg">
        <DIcon icon="fa-users" className="text-teal-600 dark:text-teal-300" />
      </div>
      <div className="mr-4 overflow-hidden">
        <Link
          href={`/dashboard/teams/${row.id}`}
          className="font-bold text-lg text-slate-800 dark:text-slate-100 hover:underline truncate block"
        >
          {row.name}
        </Link>
        <ExpandableDescription text={row.description} />
      </div>
    </div>

    {/* خط جداکننده */}
    <div className="border-t border-gray-200 dark:border-slate-700"></div>

    {/* بخش پایینی: آمار و دکمه‌ها */}
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
        <div className="text-center">
          <div className="font-semibold">{row._count?.members || 0}</div>
          <div className="text-xs">اعضا</div>
        </div>
        <div className="text-center">
          <div className="font-semibold">
            {row._count?.assignedProjects || 0}
          </div>
          <div className="text-xs">پروژه‌ها</div>
        </div>
      </div>
      <ActionsTable
        row={row}
        //   endpoint="teams"
        actions={["view", "edit", "delete"]}
        onView={`/dashboard/teams/${row.id}`}
        onEdit={`/dashboard/teams/${row.id}/update`}
      />
    </div>
  </div>
);
