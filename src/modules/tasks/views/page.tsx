// // // مسیر فایل: src/modules/tasks/views/page.tsx
"use client";

import DataTableWrapper3 from "@/@Client/Components/wrappers/DataTableWrapper3";
import { FilterOption } from "@/@Client/types";
import { usePMStatus } from "@/modules/pm-statuses/hooks/usePMStatus";
import { PMStatus } from "@/modules/pm-statuses/types";
import { useProject } from "@/modules/projects/hooks/useProject";
import { useEffect, useMemo, useState } from "react";
import TaskAssignmentFilter from "../components/TaskAssignmentFilter";
import { PriorityBadge, columnsForAdmin, listItemRender } from "../data/table";
import { useTask } from "../hooks/useTask";
import { TaskWithRelations } from "../types";

const TaskKanbanCard = ({ item }: { item: TaskWithRelations }) => (
  <div className="p-3 bg-white dark:bg-slate-700 rounded-lg border dark:border-slate-600 shadow-sm hover:shadow-md transition-shadow">
    <h4 className="font-bold text-md mb-2 text-slate-800 dark:text-slate-100">
      {item.title}
    </h4>
    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
      <div className="flex items-center">
        <span className="font-semibold ml-1">پروژه:</span>
        <span>{item.project?.name || "---"}</span>
      </div>
      <div className="flex items-center">
        <span className="font-semibold ml-1">اولویت:</span>
        <PriorityBadge priority={item.priority} />
      </div>
      {item.endDate && (
        <div className="flex items-center pt-1">
          <span className="font-semibold ml-1">تاریخ پایان:</span>
          <span>{new Date(item.endDate).toLocaleDateString("fa-IR")}</span>
        </div>
      )}
    </div>
  </div>
);

export default function IndexPage({ title = "مدیریت وظایف" }) {
  const { getAll, update, loading, error } = useTask();
  const { getAll: getAllStatuses, loading: loadingStatuses } = usePMStatus();
  const { getAll: getAllProjects, loading: loadingProjects } = useProject();

  const [taskStatuses, setTaskStatuses] = useState<PMStatus[]>([]);
  const [userProjects, setUserProjects] = useState<
    { label: string; value: number }[]
  >([]);

  // State های جدید برای مدیریت فیلترها
  const [assignmentFilters, setAssignmentFilters] = useState({});
  const [selectedProjectIds, setSelectedProjectIds] = useState<
    (string | number)[]
  >([]);

  useEffect(() => {
    getAllStatuses({ page: 1, limit: 200, type: "TASK" }).then((res) =>
      setTaskStatuses(res.data || [])
    );

    getAllProjects({ page: 1, limit: 1000, assignedTo: "me" }).then((res) => {
      const projectsForSelect = (res.data || []).map((p) => ({
        label: p.name,
        value: p.id,
      }));
      setUserProjects(projectsForSelect);
    });
  }, []);

  const filterOptions: FilterOption[] = useMemo(
    () => [
      {
        name: "projectId_in",
        label: "پروژه",
        options: [{ value: "all", label: "همه پروژه‌ها" }, ...userProjects],
      },
      {
        name: "statusId_in",
        label: "وضعیت",
        options: [
          { value: "all", label: "همه وضعیت‌ها" },
          ...taskStatuses.map((s) => ({ value: s.id, label: s.name })),
        ],
      },
      {
        name: "priority_in",
        label: "اولویت",
        options: [
          { value: "all", label: "همه" },
          { value: "low", label: "پایین" },
          { value: "medium", label: "متوسط" },
          { value: "high", label: "بالا" },
          { value: "urgent", label: "فوری" },
        ],
      },
    ],
    [userProjects, taskStatuses]
  );

  const dateFilterFields = useMemo(
    () => [
      { name: "startDate", label: "تاریخ شروع" },
      { name: "endDate", label: "تاریخ پایان" },
    ],
    []
  );

  const handleCardDrop = async (
    taskId: string | number,
    newStatusId: string | number
  ) => {
    try {
      await update(Number(taskId), { statusId: Number(newStatusId) });
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  return (
    <div className="w-full">
      <DataTableWrapper3<TaskWithRelations>
        columns={columnsForAdmin}
        createUrl="/dashboard/tasks/create"
        loading={loading || loadingStatuses || loadingProjects}
        error={error}
        title={title}
        fetcher={getAll}
        filterOptions={filterOptions}
        dateFilterFields={dateFilterFields}
        listItemRender={listItemRender}
        defaultViewMode="kanban"
        // پاس دادن فیلترهای اختصاصی به دیتا تیبل
        extraFilter={assignmentFilters}
        // پاس دادن کامپوننت فیلتر سفارشی
        customFilterComponent={
          <TaskAssignmentFilter
            selectedProjectIds={selectedProjectIds}
            onAssignmentChange={setAssignmentFilters}
          />
        }
        kanbanOptions={{
          enabled: true,
          groupByField: "statusId",
          columns: taskStatuses.map((status) => ({
            id: status.id,
            title: status.name,
          })),
          cardRender: (item) => <TaskKanbanCard item={item} />,
          onCardDrop: handleCardDrop,
        }}
      />
    </div>
  );
}
// "use client";

// import DataTableWrapper3 from "@/@Client/Components/wrappers/DataTableWrapper3";
// import { FilterOption } from "@/@Client/types";
// import { usePMStatus } from "@/modules/pm-statuses/hooks/usePMStatus";
// import { PMStatus } from "@/modules/pm-statuses/types";
// import { useProject } from "@/modules/projects/hooks/useProject";
// import { Project } from "@/modules/projects/types";
// import { useEffect, useMemo, useState } from "react";
// import { PriorityBadge, columnsForAdmin, listItemRender } from "../data/table";
// import { useTask } from "../hooks/useTask";
// import { TaskWithRelations } from "../types";

// const TaskKanbanCard = ({ item }: { item: TaskWithRelations }) => (
//   <div className="p-3 bg-white dark:bg-slate-700 rounded-lg border dark:border-slate-600 shadow-sm hover:shadow-md transition-shadow">
//     <h4 className="font-bold text-md mb-2 text-slate-800 dark:text-slate-100">
//       {item.title}
//     </h4>
//     <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
//       <div className="flex items-center">
//         <span className="font-semibold ml-1">پروژه:</span>
//         <span>{item.project?.name || "---"}</span>
//       </div>
//       <div className="flex items-center">
//         <span className="font-semibold ml-1">اولویت:</span>
//         <PriorityBadge priority={item.priority} />
//       </div>
//       {item.endDate && (
//         <div className="flex items-center pt-1">
//           <span className="font-semibold ml-1">تاریخ پایان:</span>
//           <span>{new Date(item.endDate).toLocaleDateString("fa-IR")}</span>
//         </div>
//       )}
//     </div>
//   </div>
// );

// export default function IndexPage({ isAdmin = true, title = "مدیریت وظایف" }) {
//   const { getAll, update, loading, error } = useTask();
//   const { getAll: getAllStatuses, loading: loadingStatuses } = usePMStatus();
//   const { getAll: getAllProjects, loading: loadingProjects } = useProject();

//   const [taskStatuses, setTaskStatuses] = useState<PMStatus[]>([]);
//   const [projects, setProjects] = useState<Project[]>([]);

//   useEffect(() => {
//     const fetchDataForFilters = async () => {
//       try {
//         // ===== شروع اصلاحیه =====
//         // پارامتر فیلتر را به صورت مستقیم و نه در یک آبجکت تو در تو ارسال می‌کنیم

//         const statusData = await getAllStatuses({
//           page: 1,
//           limit: 200,
//           type: "TASK", // به جای filters: { type: "TASK" }
//         });
//         // ===== پایان اصلاحیه =====
//         setTaskStatuses(statusData.data);

//         const projectData = await getAllProjects({ page: 1, limit: 500 });
//         setProjects(projectData.data);
//       } catch (err) {
//         console.error("Failed to fetch data for filters:", err);
//       }
//     };

//     fetchDataForFilters();
//   }, []);

//   const filterOptions: FilterOption[] = useMemo(
//     () => [
//       {
//         name: "assignedTo",
//         label: "اختصاص یافته به",
//         options: [
//           { value: "all", label: "همه" },
//           { value: "me", label: "وظایف من" },
//           { value: "my_teams", label: "وظایف تیم‌های من" },
//         ],
//       },
//       {
//         name: "projectId_in",
//         label: "پروژه",
//         options: [
//           { value: "all", label: "همه پروژه‌ها" },
//           ...projects.map((p) => ({ value: p.id, label: p.name })),
//         ],
//       },
//       {
//         name: "statusId_in",
//         label: "وضعیت",
//         options: [
//           { value: "all", label: "همه وضعیت‌ها" },
//           ...taskStatuses.map((s) => ({ value: s.id, label: s.name })),
//         ],
//       },
//       {
//         name: "priority_in",
//         label: "اولویت",
//         options: [
//           { value: "all", label: "همه" },
//           { value: "low", label: "پایین" },
//           { value: "medium", label: "متوسط" },
//           { value: "high", label: "بالا" },
//           { value: "urgent", label: "فوری" },
//         ],
//       },
//     ],
//     [projects, taskStatuses]
//   );

//   const dateFilterFields = useMemo(
//     () => [
//       { name: "startDate", label: "تاریخ شروع" },
//       { name: "endDate", label: "تاریخ پایان" },
//     ],
//     []
//   );

//   const handleCardDrop = async (
//     taskId: string | number,
//     newStatusId: string | number
//   ) => {
//     try {
//       await update(Number(taskId), { statusId: Number(newStatusId) });
//     } catch (err) {
//       console.error("Failed to update task status:", err);
//     }
//   };

//   return (
//     <div className="w-full">
//       <DataTableWrapper3<TaskWithRelations>
//         columns={columnsForAdmin}
//         createUrl="/dashboard/tasks/create"
//         loading={loading || loadingStatuses || loadingProjects}
//         error={error}
//         title={title}
//         fetcher={getAll}
//         filterOptions={filterOptions}
//         dateFilterFields={dateFilterFields}
//         listItemRender={listItemRender}
//         defaultViewMode="kanban"
//         kanbanOptions={{
//           enabled: true,
//           groupByField: "statusId",
//           columns: taskStatuses.map((status) => ({
//             id: status.id,
//             title: status.name,
//           })),
//           cardRender: (item) => <TaskKanbanCard item={item} />,
//           onCardDrop: handleCardDrop,
//         }}
//       />
//     </div>
//   );
// }
// "use client";

// import DataTableWrapper3 from "@/@Client/Components/wrappers/DataTableWrapper3";
// import { FilterOption } from "@/@Client/types";
// import { usePMStatus } from "@/modules/pm-statuses/hooks/usePMStatus";
// import { PMStatus } from "@/modules/pm-statuses/types";
// import { useProject } from "@/modules/projects/hooks/useProject";
// import { Project } from "@/modules/projects/types";
// import { useTask } from "@/modules/tasks/hooks/useTask";
// import { TaskWithRelations } from "@/modules/tasks/types";
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   PriorityBadge,
//   columnsForAdmin,
//   listItemRender,
// } from "../data/table";

// // ===== شروع بخش ۱: تعریف کامپوننت کارت کانبان =====
// // این کامپوننت ظاهر هر کارت وظیفه در برد کانبان را مشخص می‌کند
// const TaskKanbanCard = ({ item }: { item: TaskWithRelations }) => (
//   <div className="p-3 bg-white dark:bg-slate-700 rounded-lg border dark:border-slate-600 shadow-sm hover:shadow-md transition-shadow">
//     <h4 className="font-bold text-md mb-2 text-slate-800 dark:text-slate-100">
//       {item.title}
//     </h4>
//     <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
//       <div className="flex items-center">
//         <span className="font-semibold ml-1">پروژه:</span>
//         <span>{item.project?.name || "---"}</span>
//       </div>
//       <div className="flex items-center">
//         <span className="font-semibold ml-1">اولویت:</span>
//         <PriorityBadge priority={item.priority} />
//       </div>
//       {item.endDate && (
//         <div className="flex items-center pt-1">
//           <span className="font-semibold ml-1">تاریخ پایان:</span>
//           <span>{new Date(item.endDate).toLocaleDateString("fa-IR")}</span>
//         </div>
//       )}
//     </div>
//   </div>
// );
// // ===== پایان بخش ۱ =====

// export default function IndexPage({ isAdmin = true, title = "مدیریت وظایف" }) {
//   // === هوک‌های اصلی ===
//   const { getAll, update, loading, error } = useTask(); // `update` برای کانبان اضافه شد
//   const { getAll: getAllStatuses, loading: loadingStatuses } = usePMStatus();
//   const { getAll: getAllProjects, loading: loadingProjects } = useProject();

//   // === State برای داده‌های داینامیک فیلترها ===
//   const [taskStatuses, setTaskStatuses] = useState<PMStatus[]>([]);
//   const [projects, setProjects] = useState<Project[]>([]);

//   // === دریافت داده‌های اولیه برای فیلترها ===
//   useEffect(() => {
//     const fetchDataForFilters = async () => {
//       try {
//         const statusData = await getAllStatuses({
//           page: 1,
//           limit: 200,
//           filters: { type: "TASK" },
//         });
//         setTaskStatuses(statusData.data);

//         const projectData = await getAllProjects({ page: 1, limit: 500 });
//         setProjects(projectData.data);
//       } catch (err) {
//         console.error("Failed to fetch data for filters:", err);
//       }
//     };

//     fetchDataForFilters();
//   }, []);

//   // === تعریف آپشن‌های فیلتر (بدون تغییر) ===
//   const filterOptions: FilterOption[] = useMemo(
//     () => [
//       {
//         name: "assignedTo",
//         label: "اختصاص یافته به",
//         options: [
//           { value: "all", label: "همه" },
//           { value: "me", label: "وظایف من" },
//           { value: "my_teams", label: "وظایف تیم‌های من" },
//         ],
//       },
//       {
//         name: "projectId_in",
//         label: "پروژه",
//         options: [
//           { value: "all", label: "همه پروژه‌ها" },
//           ...projects.map((p) => ({ value: p.id, label: p.name })),
//         ],
//       },
//       {
//         name: "statusId_in",
//         label: "وضعیت",
//         options: [
//           { value: "all", label: "همه وضعیت‌ها" },
//           ...taskStatuses.map((s) => ({ value: s.id, label: s.name })),
//         ],
//       },
//       {
//         name: "priority_in",
//         label: "اولویت",
//         options: [
//           { value: "all", label: "همه" },
//           { value: "low", label: "پایین" },
//           { value: "medium", label: "متوسط" },
//           { value: "high", label: "بالا" },
//           { value: "urgent", label: "فوری" },
//         ],
//       },
//     ],
//     [projects, taskStatuses]
//   );

//   // === تعریف فیلترهای بازه تاریخ (بدون تغییر) ===
//   const dateFilterFields = useMemo(
//     () => [
//       { name: "startDate", label: "تاریخ شروع" },
//       { name: "endDate", label: "تاریخ پایان" },
//     ],
//     []
//   );

//   // ===== شروع بخش ۲: تابع برای مدیریت جابجایی کارت در کانبان =====
//   const handleCardDrop = async (
//     taskId: string | number,
//     newStatusId: string | number
//   ) => {
//     try {
//       // فقط `statusId` را برای آپدیت ارسال می‌کنیم
//       await update(Number(taskId), { statusId: Number(newStatusId) });
//       // نیازی به فراخوانی مجدد get نیست چون UI به صورت لحظه‌ای آپدیت شده است
//     } catch (err) {
//       console.error("Failed to update task status:", err);
//       // TODO: نمایش خطا به کاربر
//     }
//   };
//   // ===== پایان بخش ۲ =====

//   return (
//     <div className="w-full">
//       <DataTableWrapper3<TaskWithRelations>
//         columns={columnsForAdmin}
//         createUrl="/dashboard/tasks/create"
//         loading={loading || loadingStatuses || loadingProjects}
//         error={error}
//         title={title}
//         fetcher={getAll}
//         filterOptions={filterOptions}
//         dateFilterFields={dateFilterFields}
//         listItemRender={listItemRender}
//         defaultViewMode="kanban" // نمای پیش‌فرض را روی کانبان تنظیم می‌کنیم

//         // ===== شروع بخش ۳: تنظیمات کامل برای فعال‌سازی کانبان =====
//         kanbanOptions={{
//           enabled: true,
//           groupByField: "statusId", // وظایف بر اساس این فیلد در ستون‌ها قرار می‌گیرند
//           columns: taskStatuses.map(status => ({ // ستون‌ها از state وضعیت‌ها ساخته می‌شوند
//             id: status.id,
//             title: status.name,
//           })),
//           cardRender: (item) => <TaskKanbanCard item={item} />, // کامپوننتی که هر کارت را رندر می‌کند
//           onCardDrop: handleCardDrop, // تابعی که هنگام جابجایی کارت فراخوانی می‌شود
//         }}
//         // ===== پایان بخش ۳ =====
//       />
//     </div>
//   );
// }

// "use client";

// import DataTableWrapper from "@/@Client/Components/wrappers/DataTableWrapper2";
// import { FilterOption } from "@/@Client/types";
// import { useTask } from "@/modules/tasks/hooks/useTask"; // فرض می‌شود این هوک موجود است
// import { TaskWithRelations } from "@/modules/tasks/types"; // فرض می‌شود این تایپ موجود است
// import { columnsForAdmin, listItemRender } from "../data/table"; // فرض می‌شود این فایل‌ها موجود هستند

// // هوک‌های فرضی برای دریافت وضعیت‌ها و پروژه‌ها
// // شما باید این هوک‌ها را بر اساس ساختار پروژه خود ایجاد کنید
// import { usePMStatus } from "@/modules/pm-statuses/hooks/usePMStatus";
// import { useProject } from "@/modules/projects/hooks/useProject";
// import { PMStatus } from "@/modules/pm-statuses/types";
// import { Project } from "@/modules/projects/types";

// import { useEffect, useMemo, useState } from "react";

// export default function IndexPage({ isAdmin = true, title = "مدیریت وظایف" }) {
//   // === 1. هوک‌های اصلی ===
//   const { getAll, loading, error } = useTask();
//   const { getAll: getAllStatuses, loading: loadingStatuses } = usePMStatus();
//   const { getAll: getAllProjects, loading: loadingProjects } = useProject();

//   // === 2. State برای نگهداری داده‌های داینامیک فیلترها ===
//   const [taskStatuses, setTaskStatuses] = useState<PMStatus[]>([]);
//   const [projects, setProjects] = useState<Project[]>([]);

//   // === 3. دریافت داده‌های مورد نیاز برای فیلترها در زمان بارگذاری صفحه ===
//   useEffect(() => {
//     const fetchDataForFilters = async () => {
//       try {
//         // دریافت وضعیت‌های مربوط به وظایف
//         const statusData = await getAllStatuses({
//           page: 1,
//           limit: 200,
//           filters: { type: "TASK" }, // فیلتر کردن وضعیت‌ها فقط برای نوع وظیفه
//         });
//         setTaskStatuses(statusData.data);

//         // دریافت پروژه‌های مرتبط با کاربر
//         // بک‌اند باید منطق نمایش پروژه‌های مجاز برای کاربر را پیاده‌سازی کند
//         const projectData = await getAllProjects({ page: 1, limit: 500 });
//         setProjects(projectData.data);
//       } catch (err) {
//         console.error("Failed to fetch data for filters:", err);
//       }
//     };

//     fetchDataForFilters();
//   }, []);

//   // === 4. تعریف آپشن‌های فیلتر ===
//   const filterOptions: FilterOption[] = useMemo(
//     () => [
//       // --- فیلتر "اختصاص یافته به" ---
//       {
//         name: "assignedTo",
//         label: "اختصاص یافته به",
//         options: [
//           { value: "all", label: "همه" },
//           { value: "me", label: "وظایف من" },
//           { value: "my_teams", label: "وظایف تیم‌های من" },
//         ],
//       },
//       // --- فیلتر "پروژه" (داینامیک) ---
//       {
//         name: "projectId_in",
//         label: "پروژه",
//         options: [
//           { value: "all", label: "همه پروژه‌ها" },
//           ...projects.map((p) => ({ value: p.id, label: p.name })),
//         ],
//       },
//       // --- فیلتر "وضعیت" (داینامیک) ---
//       {
//         name: "statusId_in",
//         label: "وضعیت",
//         options: [
//           { value: "all", label: "همه وضعیت‌ها" },
//           ...taskStatuses.map((s) => ({ value: s.id, label: s.name })),
//         ],
//       },
//       // --- فیلتر "اولویت" (ثابت) ---
//       {
//         name: "priority_in",
//         label: "اولویت",
//         options: [
//           { value: "all", label: "همه" },
//           { value: "low", label: "پایین" },
//           { value: "medium", label: "متوسط" },
//           { value: "high", label: "بالا" },
//           { value: "urgent", label: "فوری" },
//         ],
//       },
//     ],
//     [projects, taskStatuses] // وابستگی به داده‌های داینامیک
//   );

//   // === 5. تعریف فیلترهای بازه تاریخ ===
//   const dateFilterFields = useMemo(
//     () => [
//       { name: "startDate", label: "تاریخ شروع" },
//       { name: "endDate", label: "تاریخ پایان" },
//     ],
//     []
//   );

//   // === 6. رندر کامپوننت اصلی ===
//   return (
//     <div className="w-full">
//       <DataTableWrapper<TaskWithRelations>
//         columns={columnsForAdmin}
//         createUrl="/dashboard/tasks/create"
//         loading={loading || loadingStatuses || loadingProjects}
//         error={error}
//         title={title}
//         fetcher={getAll}
//         filterOptions={filterOptions}
//         dateFilterFields={dateFilterFields}
//         listItemRender={listItemRender}
//         defaultViewMode="list"
//       />
//     </div>
//   );
// }

// // "use client";
// // import IndexWrapper from "@/@Client/Components/wrappers/V2/IndexWrapper";
// // import { columns } from "../data/table";
// // import { TaskRepository } from "../repo/TaskRepository";

// // const TasksPage = () => {
// //   return (
// //     <IndexWrapper columns={columns} repo={new TaskRepository()} title="وظایف" />
// //   );
// // };

// // export default TasksPage;
