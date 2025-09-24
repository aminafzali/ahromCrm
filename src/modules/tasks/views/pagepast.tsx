// // مسیر: src/modules/tasks/views/page.tsx
// // این صفحه با دیتا ورپر 5 بدرستی کار میکند که آنرا اینجا گذاشتم که بعدا اگر نیاز شد از آن
// // استفاده شود ضمنا این فایل نیاز به تغییر دیتا ورپر از 4 به 5 دارد
// "use client";

// import DataTableWrapper5, {
//   CustomFilterItem,
// } from "@/@Client/Components/wrappers/DataTableWrapper5";
// import { FilterOption } from "@/@Client/types";
// import { usePMStatus } from "@/modules/pm-statuses/hooks/usePMStatus";
// import { PMStatus } from "@/modules/pm-statuses/types";
// import { useProject } from "@/modules/projects/hooks/useProject";
// import { TeamWithRelations } from "@/modules/teams/types";
// import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
// import { useEffect, useMemo, useRef, useState } from "react";
// import { toast } from "react-toastify";
// import TaskAssignmentFilter from "../components/TaskAssignmentFilter";
// import { PriorityBadge, columnsForAdmin, listItemRender } from "../data/table";
// import { useTask } from "../hooks/useTask";
// import { TaskWithRelations } from "../types";

// /**
//  * Task Kanban page
//  * - مدیریت گروه‌بندی محلی (groupedTasks)
//  * - لاگ‌گذاری مفصل برای اشکال‌زدایی
//  * - رفع off-by-one در حرکت رو به پایین داخل همان ستون
//  * - هایلایت ستون مقصد در هنگام درگ
//  */

// /** KLog: helper ساده برای لاگ‌گذاری متمرکز */
// const KLog = {
//   d: (msg: string, obj?: any) => console.debug("[KANBAN] " + msg, obj ?? ""),
//   i: (msg: string, obj?: any) => console.info("[KANBAN] " + msg, obj ?? ""),
//   w: (msg: string, obj?: any) => console.warn("[KANBAN] " + msg, obj ?? ""),
//   e: (msg: string, obj?: any) => console.error("[KANBAN] " + msg, obj ?? ""),
// };

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

// type GroupedTasks = Record<string, TaskWithRelations[]>;

// export default function IndexPage({ title = "مدیریت وظایف" }) {
//   const { getAll, update, loading, error } = useTask();
//   const { getAll: getAllStatuses, loading: loadingStatuses } = usePMStatus();
//   const { getAll: getAllProjects, loading: loadingProjects } = useProject();

//   const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
//   const [groupedTasks, setGroupedTasks] = useState<GroupedTasks>({});

//   const [taskStatuses, setTaskStatuses] = useState<PMStatus[]>([]);
//   const [userProjects, setUserProjects] = useState<
//     { label: string; value: number }[]
//   >([]);
//   const [selectedUsers, setSelectedUsers] = useState<
//     WorkspaceUserWithRelations[]
//   >([]);
//   const [selectedTeams, setSelectedTeams] = useState<TeamWithRelations[]>([]);
//   const [selectedProjectIds, setSelectedProjectIds] = useState<
//     (string | number)[]
//   >([]);

//   // ref برای جلوگیری از ارسال همزمان چند PATCH روی یک آیتم
//   const pendingRef = useRef<Set<string>>(new Set());
//   // ref برای debounce refetch کلی (در صورت نیاز)
//   const refetchTimerRef = useRef<any>(null);

//   useEffect(() => {
//     getAllStatuses({ page: 1, limit: 200, type: "TASK" }).then((res) =>
//       setTaskStatuses(res.data || [])
//     );
//     getAllProjects({ page: 1, limit: 1000, assignedTo: "me" }).then((res) => {
//       const projectsForSelect = (res.data || []).map((p) => ({
//         label: p.name,
//         value: p.id,
//       }));
//       setUserProjects(projectsForSelect);
//     });
//   }, []);

//   // گروه‌بندی تسک‌ها براساس statusId — هر بار tasks یا taskStatuses تغییر کرد
//   useEffect(() => {
//     const groups = taskStatuses.reduce((acc, status) => {
//       const statusId = String(status.id);
//       acc[statusId] = tasks
//         .filter((task) => String(task.statusId) === statusId)
//         .sort((a, b) => (a.orderInStatus ?? 0) - (b.orderInStatus ?? 0));
//       return acc;
//     }, {} as GroupedTasks);

//     // ستون‌های خالی را هم اضافه کن
//     taskStatuses.forEach((s) => {
//       if (!groups[String(s.id)]) groups[String(s.id)] = [];
//     });

//     setGroupedTasks(groups);
//   }, [tasks, taskStatuses]);

//   const handleSelectionChange = (
//     users: WorkspaceUserWithRelations[],
//     teams: TeamWithRelations[]
//   ) => {
//     setSelectedUsers(users);
//     setSelectedTeams(teams);
//   };

//   const handleDeselectItem = (item: CustomFilterItem) => {
//     if (item.type === "team")
//       setSelectedTeams((prev) => prev.filter((t) => t.id !== item.id));
//     if (item.type === "user")
//       setSelectedUsers((prev) => prev.filter((u) => u.id !== item.id));
//   };

//   const extraFilter = useMemo(() => {
//     const filters: any = {};
//     if (selectedUsers.length > 0)
//       filters.assignedUsers_some = selectedUsers.map((u) => u.id).join(",");
//     if (selectedTeams.length > 0)
//       filters.assignedTeams_some = selectedTeams.map((t) => t.id).join(",");
//     return filters;
//   }, [selectedUsers, selectedTeams]);

//   // fetcher که DataTableWrapper4 از آن استفاده می‌کند
//   const fetchData = async (params: any) => {
//     const result = await getAll(params);
//     if (result.data) {
//       setTasks(result.data);
//     }
//     return result;
//   };

//   const filterOptions: FilterOption[] = useMemo(
//     () => [
//       {
//         name: "projectId_in",
//         label: "پروژه",
//         options: [{ value: "all", label: "همه پروژه‌ها" }, ...userProjects],
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
//     [userProjects, taskStatuses]
//   );

//   const dateFilterFields = useMemo(
//     () => [
//       { name: "startDate", label: "تاریخ شروع" },
//       { name: "endDate", label: "تاریخ پایان" },
//     ],
//     []
//   );

//   const customFilterItems: CustomFilterItem[] = useMemo(
//     () => [
//       ...selectedTeams.map((t) => ({ id: t.id, name: t.name, type: "team" })),
//       ...selectedUsers.map((u) => ({
//         id: u.id,
//         name: u.displayName ?? u.user.name,
//         type: "user",
//       })),
//     ],
//     [selectedTeams, selectedUsers]
//   );

//   // کمکی: تبدیل یک id پیش‌فرض شده مثل 'task-4' یا 'col-3' به شکل قابل استفاده
//   const stripPrefix = (prefixedId?: string | number | null) => {
//     if (prefixedId === null || prefixedId === undefined) return null;
//     const s = String(prefixedId);
//     if (s.startsWith("task-")) return { type: "task", id: s.slice(5) };
//     if (s.startsWith("col-")) return { type: "col", id: s.slice(4) };
//     // اگر فاقد پیشوند است، احتمالاً همان id خام است => فرض می‌کنیم task
//     if (/^\d+$/.test(s)) return { type: "task", id: s };
//     return null;
//   };

//   // Debounced refetch فقط در صورت نیاز (مثلاً اگر سرور داده تفاوت داشت)
//   const scheduleRefetch = (delay = 500) => {
//     if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
//     refetchTimerRef.current = setTimeout(() => {
//       KLog.d("debounced refetch triggered");
//       fetchData({ page: 1, limit: 1000 });
//     }, delay);
//   };

//   /**
//    * handleCardDrop:
//    * - active.id و over.id با فرمت 'task-<id>' یا 'col-<statusId>' دریافت می‌شوند (از DataTableWrapper4 - Kanban)
//    * - منطق optimistic update + ارسال request به سرور + reconcile با جواب سرور
//    *
//    * اصلاح off-by-one:
//    *  - از snapshot اولیه originalGroupedTasks استفاده می‌کنیم تا موقعیت اصلیِ over را بفهمیم.
//    *  - اگر از بالاتر به پایین‌تر حرکت می‌کنیم (oldIndex < originalIndexOfOver) داخل همان ستون،
//    *    باید newIndex را یک واحد جلوتر بنشانیم تا آیتم "پس از" آیتم مقصد قرار بگیرد.
//    */
//   const handleCardDrop = (active: any, over: any) => {
//     try {
//       KLog.d("handleCardDrop called", {
//         activeId: active?.id,
//         overId: over?.id,
//       });

//       if (!active || !active.id || !over || !over.id) {
//         KLog.w("handleCardDrop: active/over missing — abort");
//         return;
//       }

//       const activeParsed = stripPrefix(active.id);
//       const overParsed = stripPrefix(over.id);

//       if (!activeParsed || activeParsed.type !== "task") {
//         KLog.w("handleCardDrop: activeParsed invalid", { activeParsed });
//         return;
//       }
//       if (!overParsed) {
//         KLog.w("handleCardDrop: overParsed invalid", { overParsed });
//         return;
//       }

//       const activeId = String(activeParsed.id);

//       // پیدا کردن ستون مبدا (if exists)
//       const findContainerOfTask = (taskId: string) => {
//         return Object.keys(groupedTasks).find((k) =>
//           groupedTasks[k].some((it) => String(it.id) === taskId)
//         );
//       };
//       const fromContainerId = findContainerOfTask(activeId);

//       // تعیین ستون مقصد
//       let toContainerId: string | undefined;
//       if (overParsed.type === "col") {
//         toContainerId = String(overParsed.id);
//       } else {
//         // overParsed.type === 'task' => پیدا کردن ستون شامل آن
//         toContainerId = findContainerOfTask(String(overParsed.id));
//       }

//       if (!toContainerId) {
//         KLog.w("handleCardDrop: could not determine destination container", {
//           overParsed,
//         });
//         return;
//       }

//       // اگر هیچ تغییری نیست -> noop
//       if (
//         fromContainerId === toContainerId &&
//         activeParsed.id === overParsed.id
//       ) {
//         KLog.d("handleCardDrop: noop — same position");
//         return;
//       }

//       // snapshot برای rollback
//       const originalGroupedTasks = JSON.parse(
//         JSON.stringify(groupedTasks)
//       ) as GroupedTasks;
//       const originalTasks = JSON.parse(
//         JSON.stringify(tasks)
//       ) as TaskWithRelations[];

//       const movedTask = originalTasks.find((t) => String(t.id) === activeId);
//       if (!movedTask) {
//         KLog.e("handleCardDrop: movedTask not found in local tasks", {
//           activeId,
//         });
//         return;
//       }

//       // ساخت گروه‌بندی جدید (انجام optimistic UI)
//       const newGrouped = JSON.parse(
//         JSON.stringify(groupedTasks)
//       ) as GroupedTasks;
//       // ابتدا حذف از همه ستون‌ها (برای جلوگیری از کپی روی duplicate)
//       Object.keys(newGrouped).forEach((k) => {
//         newGrouped[k] = newGrouped[k].filter(
//           (it) => String(it.id) !== activeId
//         );
//       });

//       // محاسبه newIndex در ستون مقصد
//       // اگر over یک ستون است => append
//       let newIndex: number;
//       if (overParsed.type === "col") {
//         newIndex = (newGrouped[toContainerId] || []).length;
//       } else {
//         // overParsed.type === 'task'
//         // بعد از حذف active از جدید، اندیس آیتم over را پیدا کن (این اندیس نشان‌دهنده جای BEFORE over است)
//         newIndex = newGrouped[toContainerId].findIndex(
//           (it) => String(it.id) === String(overParsed.id)
//         );
//         if (newIndex === -1)
//           newIndex = (newGrouped[toContainerId] || []).length;

//         // *** FIX off-by-one ***
//         // اگر قرار است داخل همان ستون جا به جا شود و موقعیتِ اصلی over (در snapshot اولیه)
//         // بعد از موقعیت قدیمی active بوده (یعنی داریم به پایین‌تر می‌رویم)،
//         // می‌خواهیم آیتم _بعد از_ over درج شود، پس newIndex++.
//         if (fromContainerId === toContainerId) {
//           const originalDest = originalGroupedTasks[toContainerId] || [];
//           const originalOldIndex = originalDest.findIndex(
//             (it) => String(it.id) === activeId
//           );
//           const originalOverIndex = originalDest.findIndex(
//             (it) => String(it.id) === String(overParsed.id)
//           );
//           if (
//             originalOldIndex !== -1 &&
//             originalOverIndex !== -1 &&
//             originalOldIndex < originalOverIndex
//           ) {
//             // در این حالت ما داریم item را به پایین می‌بریم — باید بعد از over درج شود
//             newIndex = newIndex + 1;
//             KLog.d(
//               "off-by-one fix applied: moving down inside same column -> increment newIndex",
//               {
//                 activeId,
//                 originalOldIndex,
//                 originalOverIndex,
//                 adjustedNewIndex: newIndex,
//               }
//             );
//           }
//         }
//       }

//       // درج کپی موقتی کار در مقصد
//       const movedCopy = { ...movedTask };
//       if (!newGrouped[toContainerId]) newGrouped[toContainerId] = [];
//       // clamp newIndex
//       if (newIndex < 0) newIndex = 0;
//       if (newIndex > newGrouped[toContainerId].length)
//         newIndex = newGrouped[toContainerId].length;
//       newGrouped[toContainerId].splice(newIndex, 0, movedCopy);

//       // محاسبه orderInStatus جدید با نرمی و جلوگیری از clash
//       const col = newGrouped[toContainerId];
//       const idxInCol = col.findIndex((it) => String(it.id) === activeId);

//       let newOrderInStatus: number;
//       if (col.length === 1) {
//         newOrderInStatus = 1;
//       } else if (idxInCol === 0) {
//         const next = col[1];
//         const nextOrder =
//           typeof next?.orderInStatus === "number" ? next.orderInStatus : 2;
//         newOrderInStatus = nextOrder / 2;
//       } else if (idxInCol === col.length - 1) {
//         const before = col[col.length - 2];
//         const beforeOrder =
//           typeof before?.orderInStatus === "number"
//             ? before.orderInStatus
//             : col.length - 1;
//         newOrderInStatus = beforeOrder + 1;
//       } else {
//         const prev = col[idxInCol - 1];
//         const next = col[idxInCol + 1];
//         const prevOrder =
//           typeof prev?.orderInStatus === "number"
//             ? prev.orderInStatus
//             : idxInCol - 1;
//         const nextOrder =
//           typeof next?.orderInStatus === "number"
//             ? next.orderInStatus
//             : prevOrder + 2;
//         newOrderInStatus = (prevOrder + nextOrder) / 2;
//       }

//       const payload: any = { orderInStatus: newOrderInStatus };
//       if (fromContainerId !== toContainerId) {
//         payload.statusId = Number(toContainerId);
//       }

//       KLog.i("computed move", {
//         activeId,
//         from: fromContainerId,
//         to: toContainerId,
//         newIndex,
//         newOrderInStatus,
//         payload,
//       });

//       // جلوگیری از ارسال همزمان برای یک آیتم
//       if (pendingRef.current.has(activeId)) {
//         KLog.w(
//           "handleCardDrop: update already pending for this task — skipping",
//           { activeId }
//         );
//         return;
//       }

//       // optimistic update در state اصلی
//       setGroupedTasks(newGrouped);
//       setTasks((prev) => {
//         // حذف هر مورد قدیمی و افزودن نمونه‌ی محلی به‌روز شده (برای جلوگیری از duplicate)
//         const filtered = prev.filter((t) => String(t.id) !== activeId);
//         const localUpdated = {
//           ...movedTask,
//           statusId: payload.statusId ?? movedTask.statusId,
//           orderInStatus: newOrderInStatus,
//         };
//         return [...filtered, localUpdated];
//       });

//       pendingRef.current.add(activeId);

//       // ارسال به سرور
//       update(Number(activeId), payload)
//         .then((updatedTask: any) => {
//           pendingRef.current.delete(activeId);
//           KLog.d("update response received", { updatedTask });

//           // بعضی endpoints داده را در { data: ... } می‌فرستند؛ این را مدیریت کن
//           const serverTask = (updatedTask &&
//             (updatedTask.data ?? updatedTask)) as TaskWithRelations;

//           if (!serverTask || !serverTask.id) {
//             KLog.w(
//               "handleCardDrop: server returned invalid updated task -> scheduling refetch",
//               { updatedTask }
//             );
//             scheduleRefetch(400);
//             return;
//           }

//           // مطمئن شویم در tasks فقط یک نمونه داریم (replace not append)
//           setTasks((prev) => {
//             const filtered = prev.filter(
//               (t) => String(t.id) !== String(serverTask.id)
//             );
//             return [...filtered, serverTask];
//           });

//           // reconcile groupedTasks بر اساس مقدار واقعی سرور (orderInStatus و statusId)
//           setGroupedTasks((prevG) => {
//             const g = JSON.parse(JSON.stringify(prevG)) as GroupedTasks;
//             // حذف نمونه‌های قدیمی
//             Object.keys(g).forEach((k) => {
//               g[k] = g[k].filter(
//                 (it) => String(it.id) !== String(serverTask.id)
//               );
//             });
//             const dest = String(serverTask.statusId);
//             if (!g[dest]) g[dest] = [];
//             // درج در جای مناسب بر اساس orderInStatus
//             const insertIndex = g[dest].findIndex(
//               (it) => (it.orderInStatus ?? 0) > (serverTask.orderInStatus ?? 0)
//             );
//             if (insertIndex === -1) g[dest].push(serverTask);
//             else g[dest].splice(insertIndex, 0, serverTask);
//             return g;
//           });

//           KLog.i("task updated successfully on server", {
//             serverTaskId: serverTask.id,
//           });
//         })
//         .catch((err) => {
//           // rollback
//           pendingRef.current.delete(activeId);
//           KLog.e("handleCardDrop: update failed - rollback", { err });
//           toast.error("خطا در به‌روزرسانی وظیفه — بازگردانی انجام شد");
//           setTasks(originalTasks);
//           setGroupedTasks(originalGroupedTasks);
//           scheduleRefetch(200);
//         });
//     } catch (e) {
//       KLog.e("handleCardDrop unexpected error", e);
//     }
//   };

//   return (
//     <div className="w-full">
//       <DataTableWrapper5<TaskWithRelations>
//         columns={columnsForAdmin}
//         createUrl="/dashboard/tasks/create"
//         loading={loading || loadingStatuses || loadingProjects}
//         error={error}
//         title={title}
//         fetcher={fetchData}
//         filterOptions={filterOptions}
//         dateFilterFields={dateFilterFields}
//         listItemRender={listItemRender}
//         defaultViewMode="kanban"
//         extraFilter={extraFilter}
//         customFilterComponent={
//           <TaskAssignmentFilter
//             selectedProjectIds={selectedProjectIds}
//             onSelectionChange={handleSelectionChange}
//             selectedUsers={selectedUsers}
//             selectedTeams={selectedTeams}
//           />
//         }
//         customFilterItems={customFilterItems}
//         onCustomFilterItemRemove={handleDeselectItem}
//         // ---- ارسال تنظیمات کانبان (توجه: قابلیت تنظیم تاچ سنسور از اینجا)
//         kanbanOptions={{
//           enabled: true,
//           groupedData: groupedTasks,
//           columns: taskStatuses.map((status) => ({
//             id: status.id,
//             title: status.name,
//           })),
//           cardRender: (item) => <TaskKanbanCard item={item} />,
//           onCardDrop: handleCardDrop,
//         }}
//         // پارامترهای زیر را اگر خواستی تغییر بده (برای موبایل)
//         kanbanTouchConfig={{
//           // مقدار پیش‌فرض delay برای TouchSensor به میلی‌ثانیه
//           delay: 150,
//           // tolerance یا distance قابل قبول
//           tolerance: 5,
//           // فاصله PointerSensor (برای دسکتاپ) که drag را فعال می‌کند
//           pointerDistance: 5,
//         }}
//       />
//     </div>
//   );
// }

// // "use client";

// // import DataTableWrapper4, {
// //   CustomFilterItem,
// // } from "@/@Client/Components/wrappers/DataTableWrapper4";
// // import { FilterOption } from "@/@Client/types";
// // import { usePMStatus } from "@/modules/pm-statuses/hooks/usePMStatus";
// // import { PMStatus } from "@/modules/pm-statuses/types";
// // import { useProject } from "@/modules/projects/hooks/useProject";
// // import { TeamWithRelations } from "@/modules/teams/types";
// // import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
// // import { useEffect, useMemo, useRef, useState } from "react";
// // import { toast } from "react-toastify";
// // import TaskAssignmentFilter from "../components/TaskAssignmentFilter";
// // import { PriorityBadge, columnsForAdmin, listItemRender } from "../data/table";
// // import { useTask } from "../hooks/useTask";
// // import { TaskWithRelations } from "../types";

// // /**
// //  * Task Kanban page
// //  * - مدیریت گروه‌بندی محلی (groupedTasks)
// //  * - لاگ‌گذاری مفصل برای اشکال‌زدایی
// //  * - رفع off-by-one در حرکت رو به پایین داخل همان ستون
// //  * - هایلایت ستون مقصد در هنگام درگ
// //  */

// // /** KLog: helper ساده برای لاگ‌گذاری متمرکز */
// // const KLog = {
// //   d: (msg: string, obj?: any) => console.debug("[KANBAN] " + msg, obj ?? ""),
// //   i: (msg: string, obj?: any) => console.info("[KANBAN] " + msg, obj ?? ""),
// //   w: (msg: string, obj?: any) => console.warn("[KANBAN] " + msg, obj ?? ""),
// //   e: (msg: string, obj?: any) => console.error("[KANBAN] " + msg, obj ?? ""),
// // };

// // const TaskKanbanCard = ({ item }: { item: TaskWithRelations }) => (
// //   <div className="p-3 bg-white dark:bg-slate-700 rounded-lg border dark:border-slate-600 shadow-sm hover:shadow-md transition-shadow">
// //     <h4 className="font-bold text-md mb-2 text-slate-800 dark:text-slate-100">
// //       {item.title}
// //     </h4>
// //     <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
// //       <div className="flex items-center">
// //         <span className="font-semibold ml-1">پروژه:</span>
// //         <span>{item.project?.name || "---"}</span>
// //       </div>
// //       <div className="flex items-center">
// //         <span className="font-semibold ml-1">اولویت:</span>
// //         <PriorityBadge priority={item.priority} />
// //       </div>
// //       {item.endDate && (
// //         <div className="flex items-center pt-1">
// //           <span className="font-semibold ml-1">تاریخ پایان:</span>
// //           <span>{new Date(item.endDate).toLocaleDateString("fa-IR")}</span>
// //         </div>
// //       )}
// //     </div>
// //   </div>
// // );

// // type GroupedTasks = Record<string, TaskWithRelations[]>;

// // export default function IndexPage({ title = "مدیریت وظایف" }) {
// //   const { getAll, update, loading, error } = useTask();
// //   const { getAll: getAllStatuses, loading: loadingStatuses } = usePMStatus();
// //   const { getAll: getAllProjects, loading: loadingProjects } = useProject();

// //   const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
// //   const [groupedTasks, setGroupedTasks] = useState<GroupedTasks>({});

// //   const [taskStatuses, setTaskStatuses] = useState<PMStatus[]>([]);
// //   const [userProjects, setUserProjects] = useState<
// //     { label: string; value: number }[]
// //   >([]);
// //   const [selectedUsers, setSelectedUsers] = useState<
// //     WorkspaceUserWithRelations[]
// //   >([]);
// //   const [selectedTeams, setSelectedTeams] = useState<TeamWithRelations[]>([]);
// //   const [selectedProjectIds, setSelectedProjectIds] = useState<
// //     (string | number)[]
// //   >([]);

// //   // ref برای جلوگیری از ارسال همزمان چند PATCH روی یک آیتم
// //   const pendingRef = useRef<Set<string>>(new Set());
// //   // ref برای debounce refetch کلی (در صورت نیاز)
// //   const refetchTimerRef = useRef<any>(null);

// //   useEffect(() => {
// //     getAllStatuses({ page: 1, limit: 200, type: "TASK" }).then((res) =>
// //       setTaskStatuses(res.data || [])
// //     );
// //     getAllProjects({ page: 1, limit: 1000, assignedTo: "me" }).then((res) => {
// //       const projectsForSelect = (res.data || []).map((p) => ({
// //         label: p.name,
// //         value: p.id,
// //       }));
// //       setUserProjects(projectsForSelect);
// //     });
// //   }, []);

// //   // گروه‌بندی تسک‌ها براساس statusId — هر بار tasks یا taskStatuses تغییر کرد
// //   useEffect(() => {
// //     const groups = taskStatuses.reduce((acc, status) => {
// //       const statusId = String(status.id);
// //       acc[statusId] = tasks
// //         .filter((task) => String(task.statusId) === statusId)
// //         .sort((a, b) => (a.orderInStatus ?? 0) - (b.orderInStatus ?? 0));
// //       return acc;
// //     }, {} as GroupedTasks);

// //     // ستون‌های خالی را هم اضافه کن
// //     taskStatuses.forEach((s) => {
// //       if (!groups[String(s.id)]) groups[String(s.id)] = [];
// //     });

// //     setGroupedTasks(groups);
// //   }, [tasks, taskStatuses]);

// //   const handleSelectionChange = (
// //     users: WorkspaceUserWithRelations[],
// //     teams: TeamWithRelations[]
// //   ) => {
// //     setSelectedUsers(users);
// //     setSelectedTeams(teams);
// //   };

// //   const handleDeselectItem = (item: CustomFilterItem) => {
// //     if (item.type === "team")
// //       setSelectedTeams((prev) => prev.filter((t) => t.id !== item.id));
// //     if (item.type === "user")
// //       setSelectedUsers((prev) => prev.filter((u) => u.id !== item.id));
// //   };

// //   const extraFilter = useMemo(() => {
// //     const filters: any = {};
// //     if (selectedUsers.length > 0)
// //       filters.assignedUsers_some = selectedUsers.map((u) => u.id).join(",");
// //     if (selectedTeams.length > 0)
// //       filters.assignedTeams_some = selectedTeams.map((t) => t.id).join(",");
// //     return filters;
// //   }, [selectedUsers, selectedTeams]);

// //   // fetcher که DataTableWrapper4 از آن استفاده می‌کند
// //   const fetchData = async (params: any) => {
// //     const result = await getAll(params);
// //     if (result.data) {
// //       setTasks(result.data);
// //     }
// //     return result;
// //   };

// //   const filterOptions: FilterOption[] = useMemo(
// //     () => [
// //       {
// //         name: "projectId_in",
// //         label: "پروژه",
// //         options: [{ value: "all", label: "همه پروژه‌ها" }, ...userProjects],
// //       },
// //       {
// //         name: "statusId_in",
// //         label: "وضعیت",
// //         options: [
// //           { value: "all", label: "همه وضعیت‌ها" },
// //           ...taskStatuses.map((s) => ({ value: s.id, label: s.name })),
// //         ],
// //       },
// //       {
// //         name: "priority_in",
// //         label: "اولویت",
// //         options: [
// //           { value: "all", label: "همه" },
// //           { value: "low", label: "پایین" },
// //           { value: "medium", label: "متوسط" },
// //           { value: "high", label: "بالا" },
// //           { value: "urgent", label: "فوری" },
// //         ],
// //       },
// //     ],
// //     [userProjects, taskStatuses]
// //   );

// //   const dateFilterFields = useMemo(
// //     () => [
// //       { name: "startDate", label: "تاریخ شروع" },
// //       { name: "endDate", label: "تاریخ پایان" },
// //     ],
// //     []
// //   );

// //   const customFilterItems: CustomFilterItem[] = useMemo(
// //     () => [
// //       ...selectedTeams.map((t) => ({ id: t.id, name: t.name, type: "team" })),
// //       ...selectedUsers.map((u) => ({
// //         id: u.id,
// //         name: u.displayName ?? u.user.name,
// //         type: "user",
// //       })),
// //     ],
// //     [selectedTeams, selectedUsers]
// //   );

// //   // کمکی: تبدیل یک id پیش‌فرض شده مثل 'task-4' یا 'col-3' به شکل قابل استفاده
// //   const stripPrefix = (prefixedId?: string | number | null) => {
// //     if (prefixedId === null || prefixedId === undefined) return null;
// //     const s = String(prefixedId);
// //     if (s.startsWith("task-")) return { type: "task", id: s.slice(5) };
// //     if (s.startsWith("col-")) return { type: "col", id: s.slice(4) };
// //     // اگر فاقد پیشوند است، احتمالاً همان id خام است => فرض می‌کنیم task
// //     if (/^\d+$/.test(s)) return { type: "task", id: s };
// //     return null;
// //   };

// //   // Debounced refetch فقط در صورت نیاز (مثلاً اگر سرور داده تفاوت داشت)
// //   const scheduleRefetch = (delay = 500) => {
// //     if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
// //     refetchTimerRef.current = setTimeout(() => {
// //       KLog.d("debounced refetch triggered");
// //       fetchData({ page: 1, limit: 1000 });
// //     }, delay);
// //   };

// //   /**
// //    * handleCardDrop:
// //    * - active.id و over.id با فرمت 'task-<id>' یا 'col-<statusId>' دریافت می‌شوند (از DataTableWrapper4 - Kanban)
// //    * - منطق optimistic update + ارسال request به سرور + reconcile با جواب سرور
// //    *
// //    * اصلاح off-by-one:
// //    *  - از snapshot اولیه originalGroupedTasks استفاده می‌کنیم تا موقعیت اصلیِ over را بفهمیم.
// //    *  - اگر از بالاتر به پایین‌تر حرکت می‌کنیم (oldIndex < originalIndexOfOver) داخل همان ستون،
// //    *    باید newIndex را یک واحد جلوتر بنشانیم تا آیتم "پس از" آیتم مقصد قرار بگیرد.
// //    */
// //   const handleCardDrop = (active: any, over: any) => {
// //     try {
// //       KLog.d("handleCardDrop called", {
// //         activeId: active?.id,
// //         overId: over?.id,
// //       });

// //       if (!active || !active.id || !over || !over.id) {
// //         KLog.w("handleCardDrop: active/over missing — abort");
// //         return;
// //       }

// //       const activeParsed = stripPrefix(active.id);
// //       const overParsed = stripPrefix(over.id);

// //       if (!activeParsed || activeParsed.type !== "task") {
// //         KLog.w("handleCardDrop: activeParsed invalid", { activeParsed });
// //         return;
// //       }
// //       if (!overParsed) {
// //         KLog.w("handleCardDrop: overParsed invalid", { overParsed });
// //         return;
// //       }

// //       const activeId = String(activeParsed.id);

// //       // پیدا کردن ستون مبدا (if exists)
// //       const findContainerOfTask = (taskId: string) => {
// //         return Object.keys(groupedTasks).find((k) =>
// //           groupedTasks[k].some((it) => String(it.id) === taskId)
// //         );
// //       };
// //       const fromContainerId = findContainerOfTask(activeId);

// //       // تعیین ستون مقصد
// //       let toContainerId: string | undefined;
// //       if (overParsed.type === "col") {
// //         toContainerId = String(overParsed.id);
// //       } else {
// //         // overParsed.type === 'task' => پیدا کردن ستون شامل آن
// //         toContainerId = findContainerOfTask(String(overParsed.id));
// //       }

// //       if (!toContainerId) {
// //         KLog.w("handleCardDrop: could not determine destination container", {
// //           overParsed,
// //         });
// //         return;
// //       }

// //       // اگر هیچ تغییری نیست -> noop
// //       if (
// //         fromContainerId === toContainerId &&
// //         activeParsed.id === overParsed.id
// //       ) {
// //         KLog.d("handleCardDrop: noop — same position");
// //         return;
// //       }

// //       // snapshot برای rollback
// //       const originalGroupedTasks = JSON.parse(
// //         JSON.stringify(groupedTasks)
// //       ) as GroupedTasks;
// //       const originalTasks = JSON.parse(
// //         JSON.stringify(tasks)
// //       ) as TaskWithRelations[];

// //       const movedTask = originalTasks.find((t) => String(t.id) === activeId);
// //       if (!movedTask) {
// //         KLog.e("handleCardDrop: movedTask not found in local tasks", {
// //           activeId,
// //         });
// //         return;
// //       }

// //       // ساخت گروه‌بندی جدید (انجام optimistic UI)
// //       const newGrouped = JSON.parse(
// //         JSON.stringify(groupedTasks)
// //       ) as GroupedTasks;
// //       // ابتدا حذف از همه ستون‌ها (برای جلوگیری از کپی روی duplicate)
// //       Object.keys(newGrouped).forEach((k) => {
// //         newGrouped[k] = newGrouped[k].filter(
// //           (it) => String(it.id) !== activeId
// //         );
// //       });

// //       // محاسبه newIndex در ستون مقصد
// //       // اگر over یک ستون است => append
// //       let newIndex: number;
// //       if (overParsed.type === "col") {
// //         newIndex = (newGrouped[toContainerId] || []).length;
// //       } else {
// //         // overParsed.type === 'task'
// //         // بعد از حذف active از جدید، اندیس آیتم over را پیدا کن (این اندیس نشان‌دهنده جای BEFORE over است)
// //         newIndex = newGrouped[toContainerId].findIndex(
// //           (it) => String(it.id) === String(overParsed.id)
// //         );
// //         if (newIndex === -1)
// //           newIndex = (newGrouped[toContainerId] || []).length;

// //         // *** FIX off-by-one ***
// //         // اگر قرار است داخل همان ستون جا به جا شود و موقعیتِ اصلی over (در snapshot اولیه)
// //         // بعد از موقعیت قدیمی active بوده (یعنی داریم به پایین‌تر می‌رویم)،
// //         // می‌خواهیم آیتم _بعد از_ over درج شود، پس newIndex++.
// //         if (fromContainerId === toContainerId) {
// //           const originalDest = originalGroupedTasks[toContainerId] || [];
// //           const originalOldIndex = originalDest.findIndex(
// //             (it) => String(it.id) === activeId
// //           );
// //           const originalOverIndex = originalDest.findIndex(
// //             (it) => String(it.id) === String(overParsed.id)
// //           );
// //           if (
// //             originalOldIndex !== -1 &&
// //             originalOverIndex !== -1 &&
// //             originalOldIndex < originalOverIndex
// //           ) {
// //             // در این حالت ما داریم item را به پایین می‌بریم — باید بعد از over درج شود
// //             newIndex = newIndex + 1;
// //             KLog.d(
// //               "off-by-one fix applied: moving down inside same column -> increment newIndex",
// //               {
// //                 activeId,
// //                 originalOldIndex,
// //                 originalOverIndex,
// //                 adjustedNewIndex: newIndex,
// //               }
// //             );
// //           }
// //         }
// //       }

// //       // درج کپی موقتی کار در مقصد
// //       const movedCopy = { ...movedTask };
// //       if (!newGrouped[toContainerId]) newGrouped[toContainerId] = [];
// //       // clamp newIndex
// //       if (newIndex < 0) newIndex = 0;
// //       if (newIndex > newGrouped[toContainerId].length)
// //         newIndex = newGrouped[toContainerId].length;
// //       newGrouped[toContainerId].splice(newIndex, 0, movedCopy);

// //       // محاسبه orderInStatus جدید با نرمی و جلوگیری از clash
// //       const col = newGrouped[toContainerId];
// //       const idxInCol = col.findIndex((it) => String(it.id) === activeId);

// //       let newOrderInStatus: number;
// //       if (col.length === 1) {
// //         newOrderInStatus = 1;
// //       } else if (idxInCol === 0) {
// //         const next = col[1];
// //         const nextOrder =
// //           typeof next?.orderInStatus === "number" ? next.orderInStatus : 2;
// //         newOrderInStatus = nextOrder / 2;
// //       } else if (idxInCol === col.length - 1) {
// //         const before = col[col.length - 2];
// //         const beforeOrder =
// //           typeof before?.orderInStatus === "number"
// //             ? before.orderInStatus
// //             : col.length - 1;
// //         newOrderInStatus = beforeOrder + 1;
// //       } else {
// //         const prev = col[idxInCol - 1];
// //         const next = col[idxInCol + 1];
// //         const prevOrder =
// //           typeof prev?.orderInStatus === "number"
// //             ? prev.orderInStatus
// //             : idxInCol - 1;
// //         const nextOrder =
// //           typeof next?.orderInStatus === "number"
// //             ? next.orderInStatus
// //             : prevOrder + 2;
// //         newOrderInStatus = (prevOrder + nextOrder) / 2;
// //       }

// //       const payload: any = { orderInStatus: newOrderInStatus };
// //       if (fromContainerId !== toContainerId) {
// //         payload.statusId = Number(toContainerId);
// //       }

// //       KLog.i("computed move", {
// //         activeId,
// //         from: fromContainerId,
// //         to: toContainerId,
// //         newIndex,
// //         newOrderInStatus,
// //         payload,
// //       });

// //       // جلوگیری از ارسال همزمان برای یک آیتم
// //       if (pendingRef.current.has(activeId)) {
// //         KLog.w(
// //           "handleCardDrop: update already pending for this task — skipping",
// //           { activeId }
// //         );
// //         return;
// //       }

// //       // optimistic update در state اصلی
// //       setGroupedTasks(newGrouped);
// //       setTasks((prev) => {
// //         // حذف هر مورد قدیمی و افزودن نمونه‌ی محلی به‌روز شده (برای جلوگیری از duplicate)
// //         const filtered = prev.filter((t) => String(t.id) !== activeId);
// //         const localUpdated = {
// //           ...movedTask,
// //           statusId: payload.statusId ?? movedTask.statusId,
// //           orderInStatus: newOrderInStatus,
// //         };
// //         return [...filtered, localUpdated];
// //       });

// //       pendingRef.current.add(activeId);

// //       // ارسال به سرور
// //       update(Number(activeId), payload)
// //         .then((updatedTask: any) => {
// //           pendingRef.current.delete(activeId);
// //           KLog.d("update response received", { updatedTask });

// //           // بعضی endpoints داده را در { data: ... } می‌فرستند؛ این را مدیریت کن
// //           const serverTask = (updatedTask &&
// //             (updatedTask.data ?? updatedTask)) as TaskWithRelations;

// //           if (!serverTask || !serverTask.id) {
// //             KLog.w(
// //               "handleCardDrop: server returned invalid updated task -> scheduling refetch",
// //               { updatedTask }
// //             );
// //             scheduleRefetch(400);
// //             return;
// //           }

// //           // مطمئن شویم در tasks فقط یک نمونه داریم (replace not append)
// //           setTasks((prev) => {
// //             const filtered = prev.filter(
// //               (t) => String(t.id) !== String(serverTask.id)
// //             );
// //             return [...filtered, serverTask];
// //           });

// //           // reconcile groupedTasks بر اساس مقدار واقعی سرور (orderInStatus و statusId)
// //           setGroupedTasks((prevG) => {
// //             const g = JSON.parse(JSON.stringify(prevG)) as GroupedTasks;
// //             // حذف نمونه‌های قدیمی
// //             Object.keys(g).forEach((k) => {
// //               g[k] = g[k].filter(
// //                 (it) => String(it.id) !== String(serverTask.id)
// //               );
// //             });
// //             const dest = String(serverTask.statusId);
// //             if (!g[dest]) g[dest] = [];
// //             // درج در جای مناسب بر اساس orderInStatus
// //             const insertIndex = g[dest].findIndex(
// //               (it) => (it.orderInStatus ?? 0) > (serverTask.orderInStatus ?? 0)
// //             );
// //             if (insertIndex === -1) g[dest].push(serverTask);
// //             else g[dest].splice(insertIndex, 0, serverTask);
// //             return g;
// //           });

// //           KLog.i("task updated successfully on server", {
// //             serverTaskId: serverTask.id,
// //           });
// //         })
// //         .catch((err) => {
// //           // rollback
// //           pendingRef.current.delete(activeId);
// //           KLog.e("handleCardDrop: update failed - rollback", { err });
// //           toast.error("خطا در به‌روزرسانی وظیفه — بازگردانی انجام شد");
// //           setTasks(originalTasks);
// //           setGroupedTasks(originalGroupedTasks);
// //           scheduleRefetch(200);
// //         });
// //     } catch (e) {
// //       KLog.e("handleCardDrop unexpected error", e);
// //     }
// //   };

// //   return (
// //     <div className="w-full">
// //       <DataTableWrapper4<TaskWithRelations>
// //         columns={columnsForAdmin}
// //         createUrl="/dashboard/tasks/create"
// //         loading={loading || loadingStatuses || loadingProjects}
// //         error={error}
// //         title={title}
// //         fetcher={fetchData}
// //         filterOptions={filterOptions}
// //         dateFilterFields={dateFilterFields}
// //         listItemRender={listItemRender}
// //         defaultViewMode="kanban"
// //         extraFilter={extraFilter}
// //         customFilterComponent={
// //           <TaskAssignmentFilter
// //             selectedProjectIds={selectedProjectIds}
// //             onSelectionChange={handleSelectionChange}
// //             selectedUsers={selectedUsers}
// //             selectedTeams={selectedTeams}
// //           />
// //         }
// //         customFilterItems={customFilterItems}
// //         onCustomFilterItemRemove={handleDeselectItem}
// //         // ---- ارسال تنظیمات کانبان (توجه: قابلیت تنظیم تاچ سنسور از اینجا)
// //         kanbanOptions={{
// //           enabled: true,
// //           groupedData: groupedTasks,
// //           columns: taskStatuses.map((status) => ({
// //             id: status.id,
// //             title: status.name,
// //           })),
// //           cardRender: (item) => <TaskKanbanCard item={item} />,
// //           onCardDrop: handleCardDrop,
// //         }}
// //         // پارامترهای زیر را اگر خواستی تغییر بده (برای موبایل)
// //         kanbanTouchConfig={{
// //           // مقدار پیش‌فرض delay برای TouchSensor به میلی‌ثانیه
// //           delay: 150,
// //           // tolerance یا distance قابل قبول
// //           tolerance: 5,
// //           // فاصله PointerSensor (برای دسکتاپ) که drag را فعال می‌کند
// //           pointerDistance: 5,
// //         }}
// //       />
// //     </div>
// //   );
// // }

// // "use client";

// // import DataTableWrapper4, {
// //   CustomFilterItem,
// // } from "@/@Client/Components/wrappers/DataTableWrapper4";
// // import { FilterOption } from "@/@Client/types";
// // import { usePMStatus } from "@/modules/pm-statuses/hooks/usePMStatus";
// // import { PMStatus } from "@/modules/pm-statuses/types";
// // import { useProject } from "@/modules/projects/hooks/useProject";
// // import { TeamWithRelations } from "@/modules/teams/types";
// // import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
// // import { useEffect, useMemo, useRef, useState } from "react";
// // import { toast } from "react-toastify";
// // import TaskAssignmentFilter from "../components/TaskAssignmentFilter";
// // import { PriorityBadge, columnsForAdmin, listItemRender } from "../data/table";
// // import { useTask } from "../hooks/useTask";
// // import { TaskWithRelations } from "../types";

// // /**
// //  * KLog: helper ساده برای لاگ‌گذاری متمرکز
// //  * - از console.debug/info/warn/error استفاده می‌کند
// //  * - تمام لاگ‌ها با برچسب [KANBAN] ارسال می‌شوند
// //  */
// // const KLog = {
// //   d: (msg: string, obj?: any) => console.debug("[KANBAN] " + msg, obj ?? ""),
// //   i: (msg: string, obj?: any) => console.info("[KANBAN] " + msg, obj ?? ""),
// //   w: (msg: string, obj?: any) => console.warn("[KANBAN] " + msg, obj ?? ""),
// //   e: (msg: string, obj?: any) => console.error("[KANBAN] " + msg, obj ?? ""),
// // };

// // const TaskKanbanCard = ({ item }: { item: TaskWithRelations }) => (
// //   <div
// //     className="p-3 bg-white dark:bg-slate-700 rounded-lg border dark:border-slate-600 shadow-sm hover:shadow-md transition-shadow"
// //     // کلید یکتا در رندر اصلی هم task-<ID> استفاده می‌شود (در wrapper)
// //   >
// //     <h4 className="font-bold text-md mb-2 text-slate-800 dark:text-slate-100">
// //       {item.title}
// //     </h4>
// //     <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
// //       <div className="flex items-center">
// //         <span className="font-semibold ml-1">پروژه:</span>
// //         <span>{item.project?.name || "---"}</span>
// //       </div>
// //       <div className="flex items-center">
// //         <span className="font-semibold ml-1">اولویت:</span>
// //         <PriorityBadge priority={item.priority} />
// //       </div>
// //       {item.endDate && (
// //         <div className="flex items-center pt-1">
// //           <span className="font-semibold ml-1">تاریخ پایان:</span>
// //           <span>{new Date(item.endDate).toLocaleDateString("fa-IR")}</span>
// //         </div>
// //       )}
// //     </div>
// //   </div>
// // );

// // type GroupedTasks = Record<string, TaskWithRelations[]>;

// // export default function IndexPage({ title = "مدیریت وظایف" }) {
// //   const { getAll, update, loading, error } = useTask();
// //   const { getAll: getAllStatuses, loading: loadingStatuses } = usePMStatus();
// //   const { getAll: getAllProjects, loading: loadingProjects } = useProject();

// //   const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
// //   const [groupedTasks, setGroupedTasks] = useState<GroupedTasks>({});

// //   const [taskStatuses, setTaskStatuses] = useState<PMStatus[]>([]);
// //   const [userProjects, setUserProjects] = useState<
// //     { label: string; value: number }[]
// //   >([]);
// //   const [selectedUsers, setSelectedUsers] = useState<
// //     WorkspaceUserWithRelations[]
// //   >([]);
// //   const [selectedTeams, setSelectedTeams] = useState<TeamWithRelations[]>([]);
// //   const [selectedProjectIds, setSelectedProjectIds] = useState<
// //     (string | number)[]
// //   >([]);

// //   // ref برای جلوگیری از ارسال همزمان چند PATCH روی یک آیتم
// //   const pendingRef = useRef<Set<string>>(new Set());
// //   // ref برای debounce refetch کلی (در صورت نیاز)
// //   const refetchTimerRef = useRef<any>(null);

// //   useEffect(() => {
// //     // بارگذاری وضعیت‌ها و پروژه‌ها
// //     getAllStatuses({ page: 1, limit: 200, type: "TASK" }).then((res) =>
// //       setTaskStatuses(res.data || [])
// //     );
// //     getAllProjects({ page: 1, limit: 1000, assignedTo: "me" }).then((res) => {
// //       const projectsForSelect = (res.data || []).map((p) => ({
// //         label: p.name,
// //         value: p.id,
// //       }));
// //       setUserProjects(projectsForSelect);
// //     });
// //   }, []);

// //   // گروه‌بندی تسک‌ها براساس statusId — هر بار tasks یا taskStatuses تغییر کرد
// //   useEffect(() => {
// //     const groups = taskStatuses.reduce((acc, status) => {
// //       const statusId = String(status.id);
// //       acc[statusId] = tasks
// //         .filter((task) => String(task.statusId) === statusId)
// //         .sort((a, b) => (a.orderInStatus ?? 0) - (b.orderInStatus ?? 0));
// //       return acc;
// //     }, {} as GroupedTasks);

// //     // ستون‌های خالی را هم اضافه کن
// //     taskStatuses.forEach((s) => {
// //       if (!groups[String(s.id)]) groups[String(s.id)] = [];
// //     });

// //     setGroupedTasks(groups);
// //   }, [tasks, taskStatuses]);

// //   const handleSelectionChange = (
// //     users: WorkspaceUserWithRelations[],
// //     teams: TeamWithRelations[]
// //   ) => {
// //     setSelectedUsers(users);
// //     setSelectedTeams(teams);
// //   };

// //   const handleDeselectItem = (item: CustomFilterItem) => {
// //     if (item.type === "team")
// //       setSelectedTeams((prev) => prev.filter((t) => t.id !== item.id));
// //     if (item.type === "user")
// //       setSelectedUsers((prev) => prev.filter((u) => u.id !== item.id));
// //   };

// //   const extraFilter = useMemo(() => {
// //     const filters: any = {};
// //     if (selectedUsers.length > 0)
// //       filters.assignedUsers_some = selectedUsers.map((u) => u.id).join(",");
// //     if (selectedTeams.length > 0)
// //       filters.assignedTeams_some = selectedTeams.map((t) => t.id).join(",");
// //     return filters;
// //   }, [selectedUsers, selectedTeams]);

// //   // fetcher که DataTableWrapper4 از آن استفاده می‌کند
// //   const fetchData = async (params: any) => {
// //     const result = await getAll(params);
// //     if (result.data) {
// //       setTasks(result.data);
// //     }
// //     return result;
// //   };

// //   const filterOptions: FilterOption[] = useMemo(
// //     () => [
// //       {
// //         name: "projectId_in",
// //         label: "پروژه",
// //         options: [{ value: "all", label: "همه پروژه‌ها" }, ...userProjects],
// //       },
// //       {
// //         name: "statusId_in",
// //         label: "وضعیت",
// //         options: [
// //           { value: "all", label: "همه وضعیت‌ها" },
// //           ...taskStatuses.map((s) => ({ value: s.id, label: s.name })),
// //         ],
// //       },
// //       {
// //         name: "priority_in",
// //         label: "اولویت",
// //         options: [
// //           { value: "all", label: "همه" },
// //           { value: "low", label: "پایین" },
// //           { value: "medium", label: "متوسط" },
// //           { value: "high", label: "بالا" },
// //           { value: "urgent", label: "فوری" },
// //         ],
// //       },
// //     ],
// //     [userProjects, taskStatuses]
// //   );

// //   const dateFilterFields = useMemo(
// //     () => [
// //       { name: "startDate", label: "تاریخ شروع" },
// //       { name: "endDate", label: "تاریخ پایان" },
// //     ],
// //     []
// //   );

// //   const customFilterItems: CustomFilterItem[] = useMemo(
// //     () => [
// //       ...selectedTeams.map((t) => ({ id: t.id, name: t.name, type: "team" })),
// //       ...selectedUsers.map((u) => ({
// //         id: u.id,
// //         name: u.displayName ?? u.user.name,
// //         type: "user",
// //       })),
// //     ],
// //     [selectedTeams, selectedUsers]
// //   );

// //   // کمکی: تبدیل یک id پیش‌فرض شده مثل 'task-4' یا 'col-3' به شکل قابل استفاده
// //   const stripPrefix = (prefixedId?: string | number | null) => {
// //     if (prefixedId === null || prefixedId === undefined) return null;
// //     const s = String(prefixedId);
// //     if (s.startsWith("task-")) return { type: "task", id: s.slice(5) };
// //     if (s.startsWith("col-")) return { type: "col", id: s.slice(4) };
// //     // اگر فاقد پیشوند است، احتمالاً همان id خام است => فرض می‌کنیم task
// //     // اما این حالت را نیز صریحاً مدیریت می‌کنیم تا باگ ایجاد نشود
// //     if (/^\d+$/.test(s)) return { type: "task", id: s };
// //     return null;
// //   };

// //   // Debounced refetch فقط در صورت نیاز (مثلاً اگر سرور داده تفاوت داشت)
// //   const scheduleRefetch = (delay = 500) => {
// //     if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
// //     refetchTimerRef.current = setTimeout(() => {
// //       KLog.d("debounced refetch triggered");
// //       fetchData({ page: 1, limit: 1000 });
// //     }, delay);
// //   };

// //   /**
// //    * handleCardDrop:
// //    * - active.id و over.id با فرمت 'task-<id>' یا 'col-<statusId>' دریافت می‌شوند (از DataTableWrapper4 - Kanban)
// //    * - منطق optimistic update + ارسال request به سرور + reconcile با جواب سرور
// //    */
// //   const handleCardDrop = (active: any, over: any) => {
// //     try {
// //       KLog.d("handleCardDrop called", {
// //         activeId: active?.id,
// //         overId: over?.id,
// //       });

// //       if (!active || !active.id || !over || !over.id) {
// //         KLog.w("handleCardDrop: active/over missing — abort");
// //         return;
// //       }

// //       const activeParsed = stripPrefix(active.id);
// //       const overParsed = stripPrefix(over.id);

// //       if (!activeParsed || activeParsed.type !== "task") {
// //         KLog.w("handleCardDrop: activeParsed invalid", { activeParsed });
// //         return;
// //       }
// //       if (!overParsed) {
// //         KLog.w("handleCardDrop: overParsed invalid", { overParsed });
// //         return;
// //       }

// //       const activeId = String(activeParsed.id);

// //       // پیدا کردن ستون مبدا (if exists)
// //       const findContainerOfTask = (taskId: string) => {
// //         return Object.keys(groupedTasks).find((k) =>
// //           groupedTasks[k].some((it) => String(it.id) === taskId)
// //         );
// //       };
// //       const fromContainerId = findContainerOfTask(activeId);

// //       // تعیین ستون مقصد
// //       let toContainerId: string | undefined;
// //       if (overParsed.type === "col") {
// //         toContainerId = String(overParsed.id);
// //       } else {
// //         // overParsed.type === 'task' => پیدا کردن ستون شامل آن
// //         toContainerId = findContainerOfTask(String(overParsed.id));
// //       }

// //       if (!toContainerId) {
// //         KLog.w("handleCardDrop: could not determine destination container", {
// //           overParsed,
// //         });
// //         return;
// //       }

// //       // اگر هیچ تغییری نیست -> noop
// //       if (
// //         fromContainerId === toContainerId &&
// //         activeParsed.id === overParsed.id
// //       ) {
// //         KLog.d("handleCardDrop: noop — same position");
// //         return;
// //       }

// //       // snapshot برای rollback
// //       const originalGroupedTasks = JSON.parse(
// //         JSON.stringify(groupedTasks)
// //       ) as GroupedTasks;
// //       const originalTasks = JSON.parse(
// //         JSON.stringify(tasks)
// //       ) as TaskWithRelations[];

// //       const movedTask = originalTasks.find((t) => String(t.id) === activeId);
// //       if (!movedTask) {
// //         KLog.e("handleCardDrop: movedTask not found in local tasks", {
// //           activeId,
// //         });
// //         return;
// //       }

// //       // ساخت گروه‌بندی جدید (انجام optimistic UI)
// //       const newGrouped = JSON.parse(
// //         JSON.stringify(groupedTasks)
// //       ) as GroupedTasks;
// //       // ابتدا حذف از همه ستون‌ها (برای جلوگیری از کپی روی duplicate)
// //       Object.keys(newGrouped).forEach((k) => {
// //         newGrouped[k] = newGrouped[k].filter(
// //           (it) => String(it.id) !== activeId
// //         );
// //       });

// //       // محاسبه newIndex در ستون مقصد
// //       let newIndex: number;
// //       if (overParsed.type === "col") {
// //         newIndex = (newGrouped[toContainerId] || []).length;
// //       } else {
// //         const overIdStr = String(overParsed.id);

// //         // index آیتم مقصد در آرایه پس از حذف (index بعد از removal)
// //         const indexAfterRemoval = (newGrouped[toContainerId] || []).findIndex(
// //           (it) => String(it.id) === overIdStr
// //         );
// //         const arrLength = (newGrouped[toContainerId] || []).length;

// //         // اگر حرکت داخل همان ستون است، جهت حرکت را از snapshot اولیه تشخیص بده
// //         if (fromContainerId === toContainerId) {
// //           const originalCol = originalGroupedTasks[toContainerId] || [];
// //           const origActiveIdx = originalCol.findIndex(
// //             (it) => String(it.id) === activeId
// //           );
// //           const origOverIdx = originalCol.findIndex(
// //             (it) => String(it.id) === overIdStr
// //           );

// //           // اگر هر دو index معتبر باشند و active قبل از over بوده -> حرکت رو به پایین
// //           if (
// //             origActiveIdx !== -1 &&
// //             origOverIdx !== -1 &&
// //             origActiveIdx < origOverIdx
// //           ) {
// //             // حرکت به پایین: می‌خواهیم بعد از آیتم مقصد درج کنیم
// //             if (indexAfterRemoval === -1) newIndex = arrLength;
// //             else newIndex = indexAfterRemoval + 1;
// //           } else {
// //             // حرکت به بالا یا موارد دیگر: قبل از آیتم مقصد قرار بده
// //             if (indexAfterRemoval === -1) newIndex = arrLength;
// //             else newIndex = indexAfterRemoval;
// //           }
// //         } else {
// //           // حرکت بین ستون‌ها: به قبلِ آیتم مقصد (indexAfterRemoval) درج کن
// //           if (indexAfterRemoval === -1) newIndex = arrLength;
// //           else newIndex = indexAfterRemoval;
// //         }
// //       }

// //       // درج کپی موقتی کار در مقصد
// //       const movedCopy = { ...movedTask };
// //       if (!newGrouped[toContainerId]) newGrouped[toContainerId] = [];
// //       newGrouped[toContainerId].splice(newIndex, 0, movedCopy);

// //       // محاسبه orderInStatus جدید با نرمی و جلوگیری از clash
// //       const col = newGrouped[toContainerId];
// //       const idxInCol = col.findIndex((it) => String(it.id) === activeId);

// //       let newOrderInStatus: number;
// //       if (col.length === 1) {
// //         newOrderInStatus = 1;
// //       } else if (idxInCol === 0) {
// //         const next = col[1];
// //         const nextOrder =
// //           typeof next?.orderInStatus === "number" ? next.orderInStatus : 2;
// //         newOrderInStatus = nextOrder / 2;
// //       } else if (idxInCol === col.length - 1) {
// //         const before = col[col.length - 2];
// //         const beforeOrder =
// //           typeof before?.orderInStatus === "number"
// //             ? before.orderInStatus
// //             : col.length - 1;
// //         newOrderInStatus = beforeOrder + 1;
// //       } else {
// //         const prev = col[idxInCol - 1];
// //         const next = col[idxInCol + 1];
// //         const prevOrder =
// //           typeof prev?.orderInStatus === "number"
// //             ? prev.orderInStatus
// //             : idxInCol - 1;
// //         const nextOrder =
// //           typeof next?.orderInStatus === "number"
// //             ? next.orderInStatus
// //             : prevOrder + 2;
// //         newOrderInStatus = (prevOrder + nextOrder) / 2;
// //       }

// //       const payload: any = { orderInStatus: newOrderInStatus };
// //       if (fromContainerId !== toContainerId) {
// //         payload.statusId = Number(toContainerId);
// //       }

// //       KLog.i("computed move", {
// //         activeId,
// //         from: fromContainerId,
// //         to: toContainerId,
// //         newIndex,
// //         newOrderInStatus,
// //         payload,
// //       });

// //       // جلوگیری از ارسال همزمان برای یک آیتم
// //       if (pendingRef.current.has(activeId)) {
// //         KLog.w(
// //           "handleCardDrop: update already pending for this task — skipping",
// //           { activeId }
// //         );
// //         return;
// //       }

// //       // optimistic update در state اصلی
// //       setGroupedTasks(newGrouped);
// //       setTasks((prev) => {
// //         // حذف هر مورد قدیمی و افزودن نمونه‌ی محلی به‌روز شده (برای جلوگیری از duplicate)
// //         const filtered = prev.filter((t) => String(t.id) !== activeId);
// //         const localUpdated = {
// //           ...movedTask,
// //           statusId: payload.statusId ?? movedTask.statusId,
// //           orderInStatus: newOrderInStatus,
// //         };
// //         return [...filtered, localUpdated];
// //       });

// //       pendingRef.current.add(activeId);

// //       // ارسال به سرور
// //       update(Number(activeId), payload)
// //         .then((updatedTask: any) => {
// //           pendingRef.current.delete(activeId);
// //           KLog.d("update response received", { updatedTask });

// //           // بعضی endpoints داده را در { data: ... } می‌فرستند؛ این را مدیریت کن
// //           const serverTask = (updatedTask &&
// //             (updatedTask.data ?? updatedTask)) as TaskWithRelations;

// //           if (!serverTask || !serverTask.id) {
// //             KLog.w(
// //               "handleCardDrop: server returned invalid updated task -> scheduling refetch",
// //               { updatedTask }
// //             );
// //             scheduleRefetch(400);
// //             return;
// //           }

// //           // مطمئن شویم در tasks فقط یک نمونه داریم (replace not append)
// //           setTasks((prev) => {
// //             const filtered = prev.filter(
// //               (t) => String(t.id) !== String(serverTask.id)
// //             );
// //             return [...filtered, serverTask];
// //           });

// //           // reconcile groupedTasks بر اساس مقدار واقعی سرور (orderInStatus و statusId)
// //           setGroupedTasks((prevG) => {
// //             const g = JSON.parse(JSON.stringify(prevG)) as GroupedTasks;
// //             // حذف نمونه‌های قدیمی
// //             Object.keys(g).forEach((k) => {
// //               g[k] = g[k].filter(
// //                 (it) => String(it.id) !== String(serverTask.id)
// //               );
// //             });
// //             const dest = String(serverTask.statusId);
// //             if (!g[dest]) g[dest] = [];
// //             // درج در جای مناسب بر اساس orderInStatus
// //             const insertIndex = g[dest].findIndex(
// //               (it) => (it.orderInStatus ?? 0) > (serverTask.orderInStatus ?? 0)
// //             );
// //             if (insertIndex === -1) g[dest].push(serverTask);
// //             else g[dest].splice(insertIndex, 0, serverTask);
// //             return g;
// //           });

// //           KLog.i("task updated successfully on server", {
// //             serverTaskId: serverTask.id,
// //           });
// //         })
// //         .catch((err) => {
// //           // rollback
// //           pendingRef.current.delete(activeId);
// //           KLog.e("handleCardDrop: update failed - rollback", { err });
// //           toast.error("خطا در به‌روزرسانی وظیفه — بازگردانی انجام شد");
// //           setTasks(originalTasks);
// //           setGroupedTasks(originalGroupedTasks);
// //           scheduleRefetch(200);
// //         });
// //     } catch (e) {
// //       KLog.e("handleCardDrop unexpected error", e);
// //     }
// //   };

// //   return (
// //     <div className="w-full">
// //       <DataTableWrapper4<TaskWithRelations>
// //         columns={columnsForAdmin}
// //         createUrl="/dashboard/tasks/create"
// //         loading={loading || loadingStatuses || loadingProjects}
// //         error={error}
// //         title={title}
// //         fetcher={fetchData}
// //         filterOptions={filterOptions}
// //         dateFilterFields={dateFilterFields}
// //         listItemRender={listItemRender}
// //         defaultViewMode="kanban"
// //         extraFilter={extraFilter}
// //         customFilterComponent={
// //           <TaskAssignmentFilter
// //             selectedProjectIds={selectedProjectIds}
// //             onSelectionChange={handleSelectionChange}
// //             selectedUsers={selectedUsers}
// //             selectedTeams={selectedTeams}
// //           />
// //         }
// //         customFilterItems={customFilterItems}
// //         onCustomFilterItemRemove={handleDeselectItem}
// //         kanbanOptions={{
// //           enabled: true,
// //           // groupedData: ما groupedTasks را پاس می‌دهیم (کلیدها = statusId به صورت رشته)
// //           groupedData: groupedTasks,
// //           // ستون‌ها را با id خام می‌دهیم — در DataTableWrapper4 ستون‌ها به col-<id> تبدیل می‌شوند
// //           columns: taskStatuses.map((status) => ({
// //             id: status.id,
// //             title: status.name,
// //           })),
// //           // کارت رندر: کلید یکتا باید task-<id> باشد؛ DataTableWrapper4 داخل خودش این را مدیریت می‌کند
// //           cardRender: (item) => <TaskKanbanCard item={item} />,
// //           onCardDrop: handleCardDrop,
// //         }}
// //       />
// //     </div>
// //   );
// // }

// // // مسیر: src/modules/tasks/views/page.tsx
// // "use client";

// // import DataTableWrapper4, { CustomFilterItem } from "@/@Client/Components/wrappers/DataTableWrapper4";
// // import { FilterOption } from "@/@Client/types";
// // import { usePMStatus } from "@/modules/pm-statuses/hooks/usePMStatus";
// // import { PMStatus } from "@/modules/pm-statuses/types";
// // import { useProject } from "@/modules/projects/hooks/useProject";
// // import { TeamWithRelations } from "@/modules/teams/types";
// // import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
// // import { arrayMove } from "@dnd-kit/sortable";
// // import { useEffect, useMemo, useRef, useState } from "react";
// // import { toast } from "react-toastify";
// // import TaskAssignmentFilter from "../components/TaskAssignmentFilter";
// // import { PriorityBadge, columnsForAdmin, listItemRender } from "../data/table";
// // import { useTask } from "../hooks/useTask";
// // import { TaskWithRelations } from "../types";

// // /**
// //  * KLog: helper ساده برای لاگ‌گذاری متمرکز
// //  * - از console.debug/info/warn/error استفاده می‌کند
// //  * - تمام لاگ‌ها با برچسب [KANBAN] ارسال می‌شوند
// //  */
// // const KLog = {
// //   d: (msg: string, obj?: any) => console.debug("[KANBAN] " + msg, obj ?? ""),
// //   i: (msg: string, obj?: any) => console.info("[KANBAN] " + msg, obj ?? ""),
// //   w: (msg: string, obj?: any) => console.warn("[KANBAN] " + msg, obj ?? ""),
// //   e: (msg: string, obj?: any) => console.error("[KANBAN] " + msg, obj ?? ""),
// // };

// // const TaskKanbanCard = ({ item }: { item: TaskWithRelations }) => (
// //   <div
// //     className="p-3 bg-white dark:bg-slate-700 rounded-lg border dark:border-slate-600 shadow-sm hover:shadow-md transition-shadow"
// //     // کلید یکتا در رندر اصلی هم task-<ID> استفاده می‌شود (در wrapper)
// //   >
// //     <h4 className="font-bold text-md mb-2 text-slate-800 dark:text-slate-100">
// //       {item.title}
// //     </h4>
// //     <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
// //       <div className="flex items-center">
// //         <span className="font-semibold ml-1">پروژه:</span>
// //         <span>{item.project?.name || "---"}</span>
// //       </div>
// //       <div className="flex items-center">
// //         <span className="font-semibold ml-1">اولویت:</span>
// //         <PriorityBadge priority={item.priority} />
// //       </div>
// //       {item.endDate && (
// //         <div className="flex items-center pt-1">
// //           <span className="font-semibold ml-1">تاریخ پایان:</span>
// //           <span>{new Date(item.endDate).toLocaleDateString("fa-IR")}</span>
// //         </div>
// //       )}
// //     </div>
// //   </div>
// // );

// // type GroupedTasks = Record<string, TaskWithRelations[]>;

// // export default function IndexPage({ title = "مدیریت وظایف" }) {
// //   const { getAll, update, loading, error } = useTask();
// //   const { getAll: getAllStatuses, loading: loadingStatuses } = usePMStatus();
// //   const { getAll: getAllProjects, loading: loadingProjects } = useProject();

// //   const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
// //   const [groupedTasks, setGroupedTasks] = useState<GroupedTasks>({});

// //   const [taskStatuses, setTaskStatuses] = useState<PMStatus[]>([]);
// //   const [userProjects, setUserProjects] = useState<{ label: string; value: number }[]>([]);
// //   const [selectedUsers, setSelectedUsers] = useState<WorkspaceUserWithRelations[]>([]);
// //   const [selectedTeams, setSelectedTeams] = useState<TeamWithRelations[]>([]);
// //   const [selectedProjectIds, setSelectedProjectIds] = useState<(string | number)[]>([]);

// //   // ref برای جلوگیری از ارسال همزمان چند PATCH روی یک آیتم
// //   const pendingRef = useRef<Set<string>>(new Set());
// //   // ref برای debounce refetch کلی (در صورت نیاز)
// //   const refetchTimerRef = useRef<any>(null);

// //   useEffect(() => {
// //     // بارگذاری وضعیت‌ها و پروژه‌ها
// //     getAllStatuses({ page: 1, limit: 200, type: "TASK" }).then((res) => setTaskStatuses(res.data || []));
// //     getAllProjects({ page: 1, limit: 1000, assignedTo: "me" }).then((res) => {
// //       const projectsForSelect = (res.data || []).map((p) => ({ label: p.name, value: p.id }));
// //       setUserProjects(projectsForSelect);
// //     });
// //   }, []);

// //   // گروه‌بندی تسک‌ها براساس statusId — هر بار tasks یا taskStatuses تغییر کرد
// //   useEffect(() => {
// //     const groups = taskStatuses.reduce((acc, status) => {
// //       const statusId = String(status.id);
// //       acc[statusId] = tasks
// //         .filter((task) => String(task.statusId) === statusId)
// //         .sort((a, b) => (a.orderInStatus ?? 0) - (b.orderInStatus ?? 0));
// //       return acc;
// //     }, {} as GroupedTasks);

// //     // ستون‌های خالی را هم اضافه کن
// //     taskStatuses.forEach((s) => {
// //       if (!groups[String(s.id)]) groups[String(s.id)] = [];
// //     });

// //     setGroupedTasks(groups);
// //   }, [tasks, taskStatuses]);

// //   const handleSelectionChange = (users: WorkspaceUserWithRelations[], teams: TeamWithRelations[]) => {
// //     setSelectedUsers(users);
// //     setSelectedTeams(teams);
// //   };

// //   const handleDeselectItem = (item: CustomFilterItem) => {
// //     if (item.type === "team") setSelectedTeams((prev) => prev.filter((t) => t.id !== item.id));
// //     if (item.type === "user") setSelectedUsers((prev) => prev.filter((u) => u.id !== item.id));
// //   };

// //   const extraFilter = useMemo(() => {
// //     const filters: any = {};
// //     if (selectedUsers.length > 0) filters.assignedUsers_some = selectedUsers.map((u) => u.id).join(",");
// //     if (selectedTeams.length > 0) filters.assignedTeams_some = selectedTeams.map((t) => t.id).join(",");
// //     return filters;
// //   }, [selectedUsers, selectedTeams]);

// //   // fetcher که DataTableWrapper4 از آن استفاده می‌کند
// //   const fetchData = async (params: any) => {
// //     const result = await getAll(params);
// //     if (result.data) {
// //       setTasks(result.data);
// //     }
// //     return result;
// //   };

// //   const filterOptions: FilterOption[] = useMemo(
// //     () => [
// //       {
// //         name: "projectId_in",
// //         label: "پروژه",
// //         options: [{ value: "all", label: "همه پروژه‌ها" }, ...userProjects],
// //       },
// //       {
// //         name: "statusId_in",
// //         label: "وضعیت",
// //         options: [{ value: "all", label: "همه وضعیت‌ها" }, ...taskStatuses.map((s) => ({ value: s.id, label: s.name }))],
// //       },
// //       {
// //         name: "priority_in",
// //         label: "اولویت",
// //         options: [
// //           { value: "all", label: "همه" },
// //           { value: "low", label: "پایین" },
// //           { value: "medium", label: "متوسط" },
// //           { value: "high", label: "بالا" },
// //           { value: "urgent", label: "فوری" },
// //         ],
// //       },
// //     ],
// //     [userProjects, taskStatuses]
// //   );

// //   const dateFilterFields = useMemo(() => [{ name: "startDate", label: "تاریخ شروع" }, { name: "endDate", label: "تاریخ پایان" }], []);

// //   const customFilterItems: CustomFilterItem[] = useMemo(
// //     () => [
// //       ...selectedTeams.map((t) => ({ id: t.id, name: t.name, type: "team" })),
// //       ...selectedUsers.map((u) => ({ id: u.id, name: u.displayName ?? u.user.name, type: "user" })),
// //     ],
// //     [selectedTeams, selectedUsers]
// //   );

// //   // کمکی: تبدیل یک id پیش‌فرض شده مثل 'task-4' یا 'col-3' به شکل قابل استفاده
// //   const stripPrefix = (prefixedId?: string | number | null) => {
// //     if (prefixedId === null || prefixedId === undefined) return null;
// //     const s = String(prefixedId);
// //     if (s.startsWith("task-")) return { type: "task", id: s.slice(5) };
// //     if (s.startsWith("col-")) return { type: "col", id: s.slice(4) };
// //     // اگر فاقد پیشوند است، احتمالاً همان id خام است => فرض می‌کنیم task
// //     // اما این حالت را نیز صریحاً مدیریت می‌کنیم تا باگ ایجاد نشود
// //     if (/^\\d+$/.test(s)) return { type: "task", id: s };
// //     return null;
// //   };

// //   // Debounced refetch فقط در صورت نیاز (مثلاً اگر سرور داده تفاوت داشت)
// //   const scheduleRefetch = (delay = 500) => {
// //     if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
// //     refetchTimerRef.current = setTimeout(() => {
// //       KLog.d("debounced refetch triggered");
// //       fetchData({ page: 1, limit: 1000 });
// //     }, delay);
// //   };

// //   /**
// //    * handleCardDrop:
// //    * - active.id و over.id با فرمت 'task-<id>' یا 'col-<statusId>' دریافت می‌شوند (از DataTableWrapper4 - Kanban)
// //    * - منطق optimistic update + ارسال request به سرور + reconcile با جواب سرور
// //    */
// //   const handleCardDrop = (active: any, over: any) => {
// //     try {
// //       KLog.d("handleCardDrop called", { activeId: active?.id, overId: over?.id });

// //       if (!active || !active.id || !over || !over.id) {
// //         KLog.w("handleCardDrop: active/over missing — abort");
// //         return;
// //       }

// //       const activeParsed = stripPrefix(active.id);
// //       const overParsed = stripPrefix(over.id);

// //       if (!activeParsed || activeParsed.type !== "task") {
// //         KLog.w("handleCardDrop: activeParsed invalid", { activeParsed });
// //         return;
// //       }
// //       if (!overParsed) {
// //         KLog.w("handleCardDrop: overParsed invalid", { overParsed });
// //         return;
// //       }

// //       const activeId = String(activeParsed.id);

// //       // پیدا کردن ستون مبدا (if exists)
// //       const findContainerOfTask = (taskId: string) => {
// //         return Object.keys(groupedTasks).find((k) => groupedTasks[k].some((it) => String(it.id) === taskId));
// //       };
// //       const fromContainerId = findContainerOfTask(activeId);

// //       // تعیین ستون مقصد
// //       let toContainerId: string | undefined;
// //       if (overParsed.type === "col") {
// //         toContainerId = String(overParsed.id);
// //       } else {
// //         // overParsed.type === 'task' => پیدا کردن ستون شامل آن
// //         toContainerId = findContainerOfTask(String(overParsed.id));
// //       }

// //       if (!toContainerId) {
// //         KLog.w("handleCardDrop: could not determine destination container", { overParsed });
// //         return;
// //       }

// //       // اگر هیچ تغییری نیست -> noop
// //       if (fromContainerId === toContainerId && activeParsed.id === overParsed.id) {
// //         KLog.d("handleCardDrop: noop — same position");
// //         return;
// //       }

// //       // snapshot برای rollback
// //       const originalGroupedTasks = JSON.parse(JSON.stringify(groupedTasks)) as GroupedTasks;
// //       const originalTasks = JSON.parse(JSON.stringify(tasks)) as TaskWithRelations[];

// //       const movedTask = originalTasks.find((t) => String(t.id) === activeId);
// //       if (!movedTask) {
// //         KLog.e("handleCardDrop: movedTask not found in local tasks", { activeId });
// //         return;
// //       }

// //       // ساخت گروه‌بندی جدید (انجام optimistic UI)
// //       const newGrouped = JSON.parse(JSON.stringify(groupedTasks)) as GroupedTasks;
// //       // ابتدا حذف از همه ستون‌ها (برای جلوگیری از کپی روی duplicate)
// //       Object.keys(newGrouped).forEach((k) => {
// //         newGrouped[k] = newGrouped[k].filter((it) => String(it.id) !== activeId);
// //       });

// //       // محاسبه newIndex در ستون مقصد
// //       let newIndex: number;
// //       if (overParsed.type === "col") {
// //         newIndex = (newGrouped[toContainerId] || []).length;
// //       } else {
// //         newIndex = newGrouped[toContainerId].findIndex((it) => String(it.id) === String(overParsed.id));
// //         if (newIndex === -1) newIndex = (newGrouped[toContainerId] || []).length;
// //       }

// //       // درج کپی موقتی کار در مقصد
// //       const movedCopy = { ...movedTask };
// //       if (!newGrouped[toContainerId]) newGrouped[toContainerId] = [];
// //       newGrouped[toContainerId].splice(newIndex, 0, movedCopy);

// //       // محاسبه orderInStatus جدید با نرمی و جلوگیری از clash
// //       const col = newGrouped[toContainerId];
// //       const idxInCol = col.findIndex((it) => String(it.id) === activeId);

// //       let newOrderInStatus: number;
// //       if (col.length === 1) {
// //         newOrderInStatus = 1;
// //       } else if (idxInCol === 0) {
// //         const next = col[1];
// //         const nextOrder = typeof next?.orderInStatus === "number" ? next.orderInStatus : 2;
// //         newOrderInStatus = nextOrder / 2;
// //       } else if (idxInCol === col.length - 1) {
// //         const before = col[col.length - 2];
// //         const beforeOrder = typeof before?.orderInStatus === "number" ? before.orderInStatus : col.length - 1;
// //         newOrderInStatus = beforeOrder + 1;
// //       } else {
// //         const prev = col[idxInCol - 1];
// //         const next = col[idxInCol + 1];
// //         const prevOrder = typeof prev?.orderInStatus === "number" ? prev.orderInStatus : idxInCol - 1;
// //         const nextOrder = typeof next?.orderInStatus === "number" ? next.orderInStatus : prevOrder + 2;
// //         newOrderInStatus = (prevOrder + nextOrder) / 2;
// //       }

// //       const payload: any = { orderInStatus: newOrderInStatus };
// //       if (fromContainerId !== toContainerId) {
// //         payload.statusId = Number(toContainerId);
// //       }

// //       KLog.i("computed move", { activeId, from: fromContainerId, to: toContainerId, newIndex, newOrderInStatus, payload });

// //       // جلوگیری از ارسال همزمان برای یک آیتم
// //       if (pendingRef.current.has(activeId)) {
// //         KLog.w("handleCardDrop: update already pending for this task — skipping", { activeId });
// //         return;
// //       }

// //       // optimistic update در state اصلی
// //       setGroupedTasks(newGrouped);
// //       setTasks((prev) => {
// //         // حذف هر مورد قدیمی و افزودن نمونه‌ی محلی به‌روز شده (برای جلوگیری از duplicate)
// //         const filtered = prev.filter((t) => String(t.id) !== activeId);
// //         const localUpdated = { ...movedTask, statusId: payload.statusId ?? movedTask.statusId, orderInStatus: newOrderInStatus };
// //         return [...filtered, localUpdated];
// //       });

// //       pendingRef.current.add(activeId);

// //       // ارسال به سرور
// //       update(Number(activeId), payload)
// //         .then((updatedTask: any) => {
// //           pendingRef.current.delete(activeId);
// //           KLog.d("update response received", { updatedTask });

// //           // بعضی endpoints داده را در { data: ... } می‌فرستند؛ این را مدیریت کن
// //           const serverTask = (updatedTask && (updatedTask.data ?? updatedTask)) as TaskWithRelations;

// //           if (!serverTask || !serverTask.id) {
// //             KLog.w("handleCardDrop: server returned invalid updated task -> scheduling refetch", { updatedTask });
// //             scheduleRefetch(400);
// //             return;
// //           }

// //           // مطمئن شویم در tasks فقط یک نمونه داریم (replace not append)
// //           setTasks((prev) => {
// //             const filtered = prev.filter((t) => String(t.id) !== String(serverTask.id));
// //             return [...filtered, serverTask];
// //           });

// //           // reconcile groupedTasks بر اساس مقدار واقعی سرور (orderInStatus و statusId)
// //           setGroupedTasks((prevG) => {
// //             const g = JSON.parse(JSON.stringify(prevG)) as GroupedTasks;
// //             // حذف نمونه‌های قدیمی
// //             Object.keys(g).forEach((k) => {
// //               g[k] = g[k].filter((it) => String(it.id) !== String(serverTask.id));
// //             });
// //             const dest = String(serverTask.statusId);
// //             if (!g[dest]) g[dest] = [];
// //             // درج در جای مناسب بر اساس orderInStatus
// //             const insertIndex = g[dest].findIndex((it) => (it.orderInStatus ?? 0) > (serverTask.orderInStatus ?? 0));
// //             if (insertIndex === -1) g[dest].push(serverTask);
// //             else g[dest].splice(insertIndex, 0, serverTask);
// //             return g;
// //           });

// //           KLog.i("task updated successfully on server", { serverTaskId: serverTask.id });
// //         })
// //         .catch((err) => {
// //           // rollback
// //           pendingRef.current.delete(activeId);
// //           KLog.e("handleCardDrop: update failed - rollback", { err });
// //           toast.error("خطا در به‌روزرسانی وظیفه — بازگردانی انجام شد");
// //           setTasks(originalTasks);
// //           setGroupedTasks(originalGroupedTasks);
// //           scheduleRefetch(200);
// //         });
// //     } catch (e) {
// //       KLog.e("handleCardDrop unexpected error", e);
// //     }
// //   };

// //   return (
// //     <div className="w-full">
// //       <DataTableWrapper4<TaskWithRelations>
// //         columns={columnsForAdmin}
// //         createUrl="/dashboard/tasks/create"
// //         loading={loading || loadingStatuses || loadingProjects}
// //         error={error}
// //         title={title}
// //         fetcher={fetchData}
// //         filterOptions={filterOptions}
// //         dateFilterFields={dateFilterFields}
// //         listItemRender={listItemRender}
// //         defaultViewMode="kanban"
// //         extraFilter={extraFilter}
// //         customFilterComponent={
// //           <TaskAssignmentFilter
// //             selectedProjectIds={selectedProjectIds}
// //             onSelectionChange={handleSelectionChange}
// //             selectedUsers={selectedUsers}
// //             selectedTeams={selectedTeams}
// //           />
// //         }
// //         customFilterItems={customFilterItems}
// //         onCustomFilterItemRemove={handleDeselectItem}
// //         kanbanOptions={{
// //           enabled: true,
// //           // groupedData: ما groupedTasks را پاس می‌دهیم (کلیدها = statusId به صورت رشته)
// //           groupedData: groupedTasks,
// //           // ستون‌ها را با id خام می‌دهیم — در DataTableWrapper4 ستون‌ها به col-<id> تبدیل می‌شوند
// //           columns: taskStatuses.map((status) => ({ id: status.id, title: status.name })),
// //           // کارت رندر: کلید یکتا باید task-<id> باشد؛ DataTableWrapper4 داخل خودش این را مدیریت می‌کند
// //           cardRender: (item) => <TaskKanbanCard item={item} />,
// //           onCardDrop: handleCardDrop,
// //         }}
// //       />
// //     </div>
// //   );
// // }

// // // مسیر: src/modules/tasks/views/page.tsx
// // // src/modules/tasks/views/page.tsx
// // "use client";

// // import DataTableWrapper4, { CustomFilterItem } from "@/@Client/Components/wrappers/DataTableWrapper4";
// // import { FilterOption } from "@/@Client/types";
// // import { usePMStatus } from "@/modules/pm-statuses/hooks/usePMStatus";
// // import { PMStatus } from "@/modules/pm-statuses/types";
// // import { useProject } from "@/modules/projects/hooks/useProject";
// // import { TeamWithRelations } from "@/modules/teams/types";
// // import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
// // import { arrayMove } from "@dnd-kit/sortable";
// // import { useEffect, useMemo, useRef, useState } from "react";
// // import { toast } from "react-toastify";
// // import TaskAssignmentFilter from "../components/TaskAssignmentFilter";
// // import { PriorityBadge, columnsForAdmin, listItemRender } from "../data/table";
// // import { useTask } from "../hooks/useTask";
// // import { TaskWithRelations } from "../types";

// // /**
// //  * توجه: این فایل با DataTableWrapper4 جدید نوشته شده است.
// //  * مهم: کانبان داخل wrapper از prefixed id استفاده می‌کند:
// //  *   ستون: "col-<statusId>"
// //  *   کارت:  "task-<taskId>"
// //  *
// //  * تمام منطق handleCardDrop مطابق با این ساختار است.
// //  */

// // const TaskKanbanCard = ({ item }: { item: TaskWithRelations }) => (
// //   <div className="p-3 bg-white dark:bg-slate-700 rounded-lg border dark:border-slate-600 shadow-sm hover:shadow-md transition-shadow">
// //     <h4 className="font-bold text-md mb-2 text-slate-800 dark:text-slate-100">{item.title}</h4>
// //     <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
// //       <div className="flex items-center">
// //         <span className="font-semibold ml-1">پروژه:</span>
// //         <span>{item.project?.name || "---"}</span>
// //       </div>
// //       <div className="flex items-center">
// //         <span className="font-semibold ml-1">اولویت:</span>
// //         <PriorityBadge priority={item.priority} />
// //       </div>
// //       {item.endDate && (
// //         <div className="flex items-center pt-1">
// //           <span className="font-semibold ml-1">تاریخ پایان:</span>
// //           <span>{new Date(item.endDate).toLocaleDateString("fa-IR")}</span>
// //         </div>
// //       )}
// //     </div>
// //   </div>
// // );

// // type GroupedTasks = Record<string, TaskWithRelations[]>;

// // export default function IndexPage({ title = "مدیریت وظایف" }) {
// //   const { getAll, update, loading, error } = useTask();
// //   const { getAll: getAllStatuses, loading: loadingStatuses } = usePMStatus();
// //   const { getAll: getAllProjects, loading: loadingProjects } = useProject();

// //   const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
// //   const [groupedTasks, setGroupedTasks] = useState<GroupedTasks>({});

// //   const [taskStatuses, setTaskStatuses] = useState<PMStatus[]>([]);
// //   const [userProjects, setUserProjects] = useState<{ label: string; value: number }[]>([]);
// //   const [selectedUsers, setSelectedUsers] = useState<WorkspaceUserWithRelations[]>([]);
// //   const [selectedTeams, setSelectedTeams] = useState<TeamWithRelations[]>([]);
// //   const [selectedProjectIds, setSelectedProjectIds] = useState<(string | number)[]>([]);

// //   // لاگر
// //   const KLog = {
// //     d: (m: string, p?: any) => console.debug("[KANBAN]", m, p ?? ""),
// //     i: (m: string, p?: any) => console.info("[KANBAN]", m, p ?? ""),
// //     w: (m: string, p?: any) => console.warn("[KANBAN]", m, p ?? ""),
// //     e: (m: string, p?: any) => console.error("[KANBAN]", m, p ?? ""),
// //   };

// //   useEffect(() => {
// //     getAllStatuses({ page: 1, limit: 200, type: "TASK" }).then((res) => setTaskStatuses(res.data || []));
// //     getAllProjects({ page: 1, limit: 1000, assignedTo: "me" }).then((res) => {
// //       const projectsForSelect = (res.data || []).map((p) => ({ label: p.name, value: p.id }));
// //       setUserProjects(projectsForSelect);
// //     });
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, []);

// //   // rebuild groupedTasks when tasks or statuses change
// //   useEffect(() => {
// //     const groups = taskStatuses.reduce((acc, status) => {
// //       const sid = String(status.id);
// //       acc[sid] = (tasks || [])
// //         .filter((task) => String(task.statusId) === sid)
// //         .sort((a, b) => (a.orderInStatus || 0) - (b.orderInStatus || 0));
// //       return acc;
// //     }, {} as GroupedTasks);

// //     taskStatuses.forEach((status) => {
// //       if (!groups[String(status.id)]) groups[String(status.id)] = [];
// //     });

// //     setGroupedTasks(groups);
// //   }, [tasks, taskStatuses]);

// //   const handleSelectionChange = (users: WorkspaceUserWithRelations[], teams: TeamWithRelations[]) => {
// //     setSelectedUsers(users);
// //     setSelectedTeams(teams);
// //   };

// //   const handleDeselectItem = (item: CustomFilterItem) => {
// //     if (item.type === "team") setSelectedTeams((prev) => prev.filter((t) => t.id !== item.id));
// //     if (item.type === "user") setSelectedUsers((prev) => prev.filter((u) => u.id !== item.id));
// //   };

// //   const extraFilter = useMemo(() => {
// //     const filters: any = {};
// //     if (selectedUsers.length > 0) filters.assignedUsers_some = selectedUsers.map((u) => u.id).join(",");
// //     if (selectedTeams.length > 0) filters.assignedTeams_some = selectedTeams.map((t) => t.id).join(",");
// //     return filters;
// //   }, [selectedUsers, selectedTeams]);

// //   const fetchData = async (params: any) => {
// //     const result = await getAll(params);
// //     if (result.data) {
// //       setTasks(result.data);
// //       KLog.i("fetched tasks", { count: result.data.length });
// //     }
// //     return result;
// //   };

// //   const filterOptions: FilterOption[] = useMemo(
// //     () => [
// //       { name: "projectId_in", label: "پروژه", options: [{ value: "all", label: "همه پروژه‌ها" }, ...userProjects] },
// //       { name: "statusId_in", label: "وضعیت", options: [{ value: "all", label: "همه وضعیت‌ها" }, ...taskStatuses.map((s) => ({ value: s.id, label: s.name }))] },
// //       { name: "priority_in", label: "اولویت", options: [{ value: "all", label: "همه" }, { value: "low", label: "پایین" }, { value: "medium", label: "متوسط" }, { value: "high", label: "بالا" }, { value: "urgent", label: "فوری" }] },
// //     ],
// //     [userProjects, taskStatuses]
// //   );

// //   const dateFilterFields = useMemo(() => [{ name: "startDate", label: "تاریخ شروع" }, { name: "endDate", label: "تاریخ پایان" }], []);
// //   const customFilterItems: CustomFilterItem[] = useMemo(() => [...selectedTeams.map((t) => ({ id: t.id, name: t.name, type: "team" })), ...selectedUsers.map((u) => ({ id: u.id, name: u.displayName ?? u.user.name, type: "user" }))], [selectedTeams, selectedUsers]);

// //   // helper: convert prefixed id to raw
// //   const stripPrefix = (prefixedId?: string | null) => {
// //     if (!prefixedId) return null;
// //     if (String(prefixedId).startsWith("task-")) return { type: "task", id: String(prefixedId).slice(5) };
// //     if (String(prefixedId).startsWith("col-")) return { type: "col", id: String(prefixedId).slice(4) };
// //     // fallback: ambiguous numeric -> treat as task by default (but ideally won't happen)
// //     return { type: "task", id: String(prefixedId) };
// //   };

// //   // helper: upsert
// //   const upsertTask = (arr: TaskWithRelations[], t: any) => {
// //     const after = arr.filter((x) => String(x.id) !== String(t.id));
// //     return [...after, t];
// //   };

// //   // pending updates to avoid race
// //   const pendingRef = useRef<Set<string>>(new Set());

// //   // debounced refetch
// //   const refetchTimer = useRef<number | null>(null);
// //   const scheduleRefetch = (delay = 300) => {
// //     if (refetchTimer.current) {
// //       clearTimeout(refetchTimer.current);
// //       refetchTimer.current = null;
// //     }

// //     refetchTimer.current = window.setTimeout(async () => {
// //       KLog.i("debounced refetch triggered");
// //       const fresh = await getAll({ page: 1, limit: 1000 });
// //       if (fresh?.data) {
// //         setTasks(fresh.data);
// //         KLog.i("refetch applied", { count: fresh.data.length });
// //       }
// //       refetchTimer.current = null;
// //     }, delay);
// //   };

// //   /**
// //    * handleCardDrop now expects active.id and over.id to be prefixed:
// //    * - task: "task-<id>"
// //    * - column: "col-<statusId>"
// //    *
// //    * Logic:
// //    *  - convert ids
// //    *  - compute newOrderInStatus using snapshot of groupedTasks
// //    *  - optimistic update locally (setTasks, setGroupedTasks)
// //    *  - send single PATCH for moved task
// //    *  - reconcile with server response; schedule refetch only on inconsistency/errors
// //    */
// //   const handleCardDrop = (active: any, over: any) => {
// //     KLog.d("handleCardDrop called", { activeId: active?.id, overId: over?.id });

// //     if (!active || !over) {
// //       KLog.w("active or over missing - abort");
// //       return;
// //     }

// //     // extract
// //     const activeParsed = stripPrefix(String(active.id));
// //     const overParsed = stripPrefix(String(over.id));

// //     if (!activeParsed || activeParsed.type !== "task") {
// //       KLog.e("active item is not a task (unexpected)", { activeParsed });
// //       return;
// //     }

// //     // determine from/to columns
// //     // from: find current column of the task from groupedTasks
// //     const taskIdStr = String(activeParsed.id);
// //     let fromColumnKey: string | undefined;
// //     for (const k of Object.keys(groupedTasks)) {
// //       if (groupedTasks[k].some((it) => String(it.id) === taskIdStr)) {
// //         fromColumnKey = k;
// //         break;
// //       }
// //     }
// //     if (!fromColumnKey) {
// //       KLog.w("could not find fromColumn for task (it may have been removed)", { taskId: taskIdStr });
// //       // try fallback: use the activeParsed id (not ideal)
// //       // continue but be cautious
// //     }

// //     // to column: if over is a column -> use over.id; if over is a task -> find its column
// //     let toColumnKey: string | undefined;
// //     if (overParsed?.type === "col") {
// //       toColumnKey = String(overParsed.id);
// //     } else {
// //       // over is a task id -> find its column
// //       const overTaskId = String(overParsed?.id);
// //       for (const k of Object.keys(groupedTasks)) {
// //         if (groupedTasks[k].some((it) => String(it.id) === overTaskId)) {
// //           toColumnKey = k;
// //           break;
// //         }
// //       }
// //     }

// //     if (!toColumnKey) {
// //       KLog.w("could not determine toColumn - aborting", { overParsed });
// //       return;
// //     }

// //     // No-op
// //     if (fromColumnKey === toColumnKey && activeParsed.id === overParsed?.id) {
// //       KLog.d("noop: same position");
// //       return;
// //     }

// //     // snapshot (deep copy) برای rollback در صورت خطا
// //     const originalGrouped = JSON.parse(JSON.stringify(groupedTasks)) as GroupedTasks;
// //     const originalTasks = JSON.parse(JSON.stringify(tasks)) as TaskWithRelations[];

// //     // moved task object
// //     const movedTask = originalTasks.find((t) => String(t.id) === taskIdStr);
// //     if (!movedTask) {
// //       KLog.e("movedTask not found in tasks list", { taskIdStr });
// //       return;
// //     }

// //     // Remove all occurrences before re-inserting
// //     Object.keys(originalGrouped).forEach((k) => {
// //       originalGrouped[k] = originalGrouped[k].filter((it) => String(it.id) !== taskIdStr);
// //     });

// //     // compute newIndex inside destination column
// //     let newIndex = -1;
// //     if (overParsed?.type === "col") {
// //       // dropped onto column (bottom) -> append
// //       newIndex = (originalGrouped[toColumnKey] || []).length;
// //     } else {
// //       // dropped onto a task -> insert before that task's index
// //       newIndex = originalGrouped[toColumnKey].findIndex((it) => String(it.id) === String(overParsed?.id));
// //       if (newIndex === -1) newIndex = (originalGrouped[toColumnKey] || []).length;
// //     }

// //     // insert copy
// //     const movedCopy = { ...movedTask };
// //     originalGrouped[toColumnKey].splice(newIndex, 0, movedCopy);

// //     // compute orderInStatus
// //     const col = originalGrouped[toColumnKey];
// //     const idxInCol = col.findIndex((it) => String(it.id) === taskIdStr);

// //     let newOrderInStatus: number;
// //     if (col.length === 1) {
// //       newOrderInStatus = 1;
// //     } else if (idxInCol === 0) {
// //       const next = col[1];
// //       const nextOrder = typeof next?.orderInStatus === "number" ? next.orderInStatus : 2;
// //       newOrderInStatus = nextOrder / 2;
// //     } else if (idxInCol === col.length - 1) {
// //       const before = col[col.length - 2];
// //       const beforeOrder = typeof before?.orderInStatus === "number" ? before.orderInStatus : col.length - 1;
// //       newOrderInStatus = beforeOrder + 1;
// //     } else {
// //       const prev = col[idxInCol - 1];
// //       const next = col[idxInCol + 1];
// //       const prevOrder = typeof prev?.orderInStatus === "number" ? prev.orderInStatus : idxInCol - 1;
// //       const nextOrder = typeof next?.orderInStatus === "number" ? next.orderInStatus : prevOrder + 2;
// //       newOrderInStatus = (prevOrder + nextOrder) / 2;
// //     }

// //     const payload: any = { orderInStatus: newOrderInStatus };
// //     if (fromColumnKey !== toColumnKey) {
// //       payload.statusId = Number(toColumnKey);
// //     }

// //     KLog.i("computed move", { activeId: activeParsed.id, from: fromColumnKey, to: toColumnKey, newIndex, newOrderInStatus, payload });

// //     // اگر همین آیتم در حال آپدیته از ارسال مجدد جلوگیری کن
// //     if (pendingRef.current.has(String(taskIdStr))) {
// //       KLog.w("update already pending for this task", { taskIdStr });
// //       return;
// //     }

// //     // optimistic local update
// //     setTasks((prev) => {
// //       const without = prev.filter((t) => String(t.id) !== taskIdStr);
// //       const updatedLocal = { ...movedTask, statusId: payload.statusId ?? movedTask.statusId, orderInStatus: newOrderInStatus };
// //       return [...without, updatedLocal];
// //     });
// //     setGroupedTasks(originalGrouped);

// //     // mark pending
// //     pendingRef.current.add(String(taskIdStr));

// //     // send PATCH
// //     KLog.d("sending update to server", { taskId: Number(taskIdStr), payload });
// //     update(Number(taskIdStr), payload)
// //       .then((resp: any) => {
// //         KLog.d("update response received", { resp });
// //         const serverTask = resp?.data ?? resp;
// //         // remove pending
// //         pendingRef.current.delete(String(taskIdStr));

// //         if (!serverTask || !serverTask.id) {
// //           KLog.w("server returned invalid updated task; scheduling full refetch", { resp });
// //           scheduleRefetch();
// //           return;
// //         }

// //         // reconcile local state with server truth for that task
// //         setTasks((prev) => {
// //           const without = prev.filter((t) => String(t.id) !== String(serverTask.id));
// //           return [...without, serverTask];
// //         });

// //         // ensure groupedTasks reflect server ordering for destination column
// //         setGroupedTasks((prevG) => {
// //           const g = JSON.parse(JSON.stringify(prevG)) as GroupedTasks;
// //           // remove any existing occurrences
// //           Object.keys(g).forEach((k) => {
// //             g[k] = g[k].filter((it) => String(it.id) !== String(serverTask.id));
// //           });
// //           const dest = String(serverTask.statusId);
// //           if (!g[dest]) g[dest] = [];
// //           // insert by server orderInStatus (simple placement)
// //           const insertIndex = g[dest].findIndex((it) => (it.orderInStatus ?? 0) > (serverTask.orderInStatus ?? 0));
// //           if (insertIndex === -1) g[dest].push(serverTask);
// //           else g[dest].splice(insertIndex, 0, serverTask);
// //           return g;
// //         });

// //         KLog.i("task updated successfully on server", { serverTaskId: serverTask.id });
// //         // no full refetch unless inconsistency detected
// //       })
// //       .catch((err) => {
// //         KLog.e("update failed - rollback", { err });
// //         pendingRef.current.delete(String(taskIdStr));
// //         toast.error("خطا در به‌روزرسانی وظیفه — بازگردانی انجام شد");
// //         setTasks(originalTasks);
// //         setGroupedTasks(originalGrouped);
// //         scheduleRefetch(100);
// //       });
// //   };

// //   return (
// //     <div className="w-full">
// //       <DataTableWrapper4<TaskWithRelations>
// //         columns={columnsForAdmin}
// //         createUrl="/dashboard/tasks/create"
// //         loading={loading || loadingStatuses || loadingProjects}
// //         error={error}
// //         title={title}
// //         fetcher={fetchData}
// //         filterOptions={filterOptions}
// //         dateFilterFields={dateFilterFields}
// //         listItemRender={listItemRender}
// //         defaultViewMode="kanban"
// //         extraFilter={extraFilter}
// //         customFilterComponent={<TaskAssignmentFilter selectedProjectIds={selectedProjectIds} onSelectionChange={handleSelectionChange} selectedUsers={selectedUsers} selectedTeams={selectedTeams} />}
// //         customFilterItems={customFilterItems}
// //         onCustomFilterItemRemove={handleDeselectItem}
// //         kanbanOptions={{
// //           enabled: true,
// //           groupedData: groupedTasks, // groupedData کلیدها را بدون prefix نگه می‌دارد (statusId as string)
// //           columns: taskStatuses.map((status) => ({ id: status.id, title: status.name })),
// //           cardRender: (item) => <TaskKanbanCard item={item} />,
// //           onCardDrop: handleCardDrop,
// //         }}
// //       />
// //     </div>
// //   );
// // }

// // "use client";

// // import DataTableWrapper4, {
// //   CustomFilterItem,
// // } from "@/@Client/Components/wrappers/DataTableWrapper4";
// // import { FilterOption } from "@/@Client/types";
// // import { usePMStatus } from "@/modules/pm-statuses/hooks/usePMStatus";
// // import { PMStatus } from "@/modules/pm-statuses/types";
// // import { useProject } from "@/modules/projects/hooks/useProject";
// // import { TeamWithRelations } from "@/modules/teams/types";
// // import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
// // import { arrayMove } from "@dnd-kit/sortable";
// // import { useEffect, useMemo, useState } from "react";
// // import { toast } from "react-toastify";
// // import TaskAssignmentFilter from "../components/TaskAssignmentFilter";
// // import { PriorityBadge, columnsForAdmin, listItemRender } from "../data/table";
// // import { useTask } from "../hooks/useTask";
// // import { TaskWithRelations } from "../types";

// // const TaskKanbanCard = ({ item }: { item: TaskWithRelations }) => (
// //   <div className="p-3 bg-white dark:bg-slate-700 rounded-lg border dark:border-slate-600 shadow-sm hover:shadow-md transition-shadow">
// //     <h4 className="font-bold text-md mb-2 text-slate-800 dark:text-slate-100">
// //       {item.title}
// //     </h4>
// //     <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
// //       <div className="flex items-center">
// //         <span className="font-semibold ml-1">پروژه:</span>
// //         <span>{item.project?.name || "---"}</span>
// //       </div>
// //       <div className="flex items-center">
// //         <span className="font-semibold ml-1">اولویت:</span>
// //         <PriorityBadge priority={item.priority} />
// //       </div>
// //       {item.endDate && (
// //         <div className="flex items-center pt-1">
// //           <span className="font-semibold ml-1">تاریخ پایان:</span>
// //           <span>{new Date(item.endDate).toLocaleDateString("fa-IR")}</span>
// //         </div>
// //       )}
// //     </div>
// //   </div>
// // );

// // type GroupedTasks = Record<string, TaskWithRelations[]>;

// // export default function IndexPage({ title = "مدیریت وظایف" }) {
// //   const { getAll, update, loading, error } = useTask();
// //   const { getAll: getAllStatuses, loading: loadingStatuses } = usePMStatus();
// //   const { getAll: getAllProjects, loading: loadingProjects } = useProject();

// //   const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
// //   const [groupedTasks, setGroupedTasks] = useState<GroupedTasks>({});

// //   const [taskStatuses, setTaskStatuses] = useState<PMStatus[]>([]);
// //   const [userProjects, setUserProjects] = useState<
// //     { label: string; value: number }[]
// //   >([]);
// //   const [selectedUsers, setSelectedUsers] = useState<
// //     WorkspaceUserWithRelations[]
// //   >([]);
// //   const [selectedTeams, setSelectedTeams] = useState<TeamWithRelations[]>([]);
// //   const [selectedProjectIds, setSelectedProjectIds] = useState<
// //     (string | number)[]
// //   >([]);

// //   useEffect(() => {
// //     getAllStatuses({ page: 1, limit: 200, type: "TASK" }).then((res) =>
// //       setTaskStatuses(res.data || [])
// //     );
// //     getAllProjects({ page: 1, limit: 1000, assignedTo: "me" }).then((res) => {
// //       const projectsForSelect = (res.data || []).map((p) => ({
// //         label: p.name,
// //         value: p.id,
// //       }));
// //       setUserProjects(projectsForSelect);
// //     });
// //   }, []);

// //   // Effect جدید برای گروه‌بندی تسک‌ها هر زمان که لیست اصلی تسک‌ها تغییر کند
// //   useEffect(() => {
// //     const groups = taskStatuses.reduce((acc, status) => {
// //       const statusId = String(status.id);
// //       acc[statusId] = tasks
// //         .filter((task) => String(task.statusId) === statusId)
// //         .sort((a, b) => (a.orderInStatus || 0) - (b.orderInStatus || 0));
// //       return acc;
// //     }, {} as GroupedTasks);

// //     // افزودن ستون‌های خالی برای وضعیت‌هایی که تسک ندارند
// //     taskStatuses.forEach((status) => {
// //       if (!groups[status.id]) {
// //         groups[status.id] = [];
// //       }
// //     });

// //     setGroupedTasks(groups);
// //   }, [tasks, taskStatuses]);

// //   const handleSelectionChange = (
// //     users: WorkspaceUserWithRelations[],
// //     teams: TeamWithRelations[]
// //   ) => {
// //     setSelectedUsers(users);
// //     setSelectedTeams(teams);
// //   };

// //   const handleDeselectItem = (item: CustomFilterItem) => {
// //     if (item.type === "team") {
// //       setSelectedTeams((prev) => prev.filter((t) => t.id !== item.id));
// //     }
// //     if (item.type === "user") {
// //       setSelectedUsers((prev) => prev.filter((u) => u.id !== item.id));
// //     }
// //   };

// //   const extraFilter = useMemo(() => {
// //     const filters: any = {};
// //     if (selectedUsers.length > 0)
// //       filters.assignedUsers_some = selectedUsers.map((u) => u.id).join(",");
// //     if (selectedTeams.length > 0)
// //       filters.assignedTeams_some = selectedTeams.map((t) => t.id).join(",");
// //     return filters;
// //   }, [selectedUsers, selectedTeams]);

// //   const fetchData = async (params: any) => {
// //     const result = await getAll(params);
// //     if (result.data) {
// //       setTasks(result.data);
// //     }
// //     return result;
// //   };

// //   const filterOptions: FilterOption[] = useMemo(
// //     () => [
// //       {
// //         name: "projectId_in",
// //         label: "پروژه",
// //         options: [{ value: "all", label: "همه پروژه‌ها" }, ...userProjects],
// //       },
// //       {
// //         name: "statusId_in",
// //         label: "وضعیت",
// //         options: [
// //           { value: "all", label: "همه وضعیت‌ها" },
// //           ...taskStatuses.map((s) => ({ value: s.id, label: s.name })),
// //         ],
// //       },
// //       {
// //         name: "priority_in",
// //         label: "اولویت",
// //         options: [
// //           { value: "all", label: "همه" },
// //           { value: "low", label: "پایین" },
// //           { value: "medium", label: "متوسط" },
// //           { value: "high", label: "بالا" },
// //           { value: "urgent", label: "فوری" },
// //         ],
// //       },
// //     ],
// //     [userProjects, taskStatuses]
// //   );

// //   const dateFilterFields = useMemo(
// //     () => [
// //       { name: "startDate", label: "تاریخ شروع" },
// //       { name: "endDate", label: "تاریخ پایان" },
// //     ],
// //     []
// //   );
// //   const customFilterItems: CustomFilterItem[] = useMemo(
// //     () => [
// //       ...selectedTeams.map((t) => ({ id: t.id, name: t.name, type: "team" })),
// //       ...selectedUsers.map((u) => ({
// //         id: u.id,
// //         name: u.displayName ?? u.user.name,
// //         type: "user",
// //       })),
// //     ],
// //     [selectedTeams, selectedUsers]
// //   );

// //   // منطق اصلی جابجایی که حالا در این فایل قرار دارد
// //   const handleCardDrop = (active: any, over: any) => {
// //     const activeId = active.id;
// //     const overId = over.id;

// //     const findContainerId = (id: string | number): string | undefined => {
// //       const stringId = String(id);
// //       if (groupedTasks[stringId]) return stringId;
// //       return Object.keys(groupedTasks).find((key) =>
// //         groupedTasks[key].some((item) => item.id === id)
// //       );
// //     };

// //     const activeContainerId = findContainerId(activeId);
// //     let overContainerId = findContainerId(overId);
// //     if (taskStatuses.some((s) => String(s.id) === String(overId))) {
// //       overContainerId = String(overId);
// //     }

// //     if (!activeContainerId || !overContainerId || activeId === overId) return;

// //     const originalGroupedTasks = JSON.parse(JSON.stringify(groupedTasks));
// //     const movedTask = tasks.find((t) => t.id === activeId);
// //     if (!movedTask) return;

// //     const oldIndex = originalGroupedTasks[activeContainerId].findIndex(
// //       (t) => t.id === activeId
// //     );
// //     let newIndex;

// //     // 1. آپدیت خوش‌بینانه UI
// //     setGroupedTasks((prev) => {
// //       const newGroupedData = JSON.parse(JSON.stringify(prev));

// //       if (activeContainerId === overContainerId) {
// //         newIndex = newGroupedData[activeContainerId].findIndex(
// //           (t) => t.id === overId
// //         );
// //         if (newIndex === -1) newIndex = oldIndex;
// //         newGroupedData[activeContainerId] = arrayMove(
// //           newGroupedData[activeContainerId],
// //           oldIndex,
// //           newIndex
// //         );
// //       } else {
// //         newGroupedData[activeContainerId].splice(oldIndex, 1);
// //         newIndex = newGroupedData[overContainerId].findIndex(
// //           (t) => t.id === overId
// //         );
// //         if (newIndex === -1) newIndex = newGroupedData[overContainerId].length;
// //         newGroupedData[overContainerId].splice(newIndex, 0, movedTask);
// //       }
// //       return newGroupedData;
// //     });

// //     // 2. محاسبه order و آپدیت بک‌اند
// //     const tasksInNewColumn = groupedTasks[overContainerId].filter(
// //       (t) => t.id !== activeId
// //     );
// //     if (activeContainerId !== overContainerId) {
// //       tasksInNewColumn.splice(newIndex, 0, movedTask);
// //     } else {
// //       const temp = arrayMove(tasksInNewColumn, oldIndex, newIndex);
// //       tasksInNewColumn.length = 0;
// //       Array.prototype.push.apply(tasksInNewColumn, temp);
// //     }

// //     let newOrderInStatus;
// //     if (tasksInNewColumn.length <= 1) {
// //       newOrderInStatus = 1;
// //     } else if (newIndex >= tasksInNewColumn.length - 1) {
// //       const beforeLastTask = tasksInNewColumn[tasksInNewColumn.length - 2];
// //       newOrderInStatus =
// //         (beforeLastTask?.orderInStatus || tasksInNewColumn.length - 2) + 1;
// //     } else if (newIndex === 0) {
// //       const nextTask = tasksInNewColumn[1];
// //       newOrderInStatus = (nextTask?.orderInStatus || 1) / 2;
// //     } else {
// //       const prevTask = tasksInNewColumn[newIndex - 1];
// //       const nextTask = tasksInNewColumn[newIndex + 1];
// //       const prevOrder = prevTask?.orderInStatus || newIndex - 1;
// //       const nextOrder = nextTask?.orderInStatus || prevOrder + 2;
// //       newOrderInStatus = (prevOrder + nextOrder) / 2;
// //     }

// //     const payload: any = { orderInStatus: newOrderInStatus };
// //     if (activeContainerId !== overContainerId) {
// //       payload.statusId = Number(overContainerId);
// //     }

// //     update(Number(activeId), payload)
// //       .then((updatedTask) => {
// //         setTasks((prev) =>
// //           prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
// //         );
// //       })
// //       .catch((err) => {
// //         console.error("Failed to update task:", err);
// //         toast.error("خطا در به‌روزرسانی وظیفه");
// //         setGroupedTasks(originalGroupedTasks);
// //       });
// //   };

// //   return (
// //     <div className="w-full">
// //       <DataTableWrapper4<TaskWithRelations>
// //         columns={columnsForAdmin}
// //         createUrl="/dashboard/tasks/create"
// //         loading={loading || loadingStatuses || loadingProjects}
// //         error={error}
// //         title={title}
// //         fetcher={fetchData}
// //         filterOptions={filterOptions}
// //         dateFilterFields={dateFilterFields}
// //         listItemRender={listItemRender}
// //         defaultViewMode="kanban"
// //         extraFilter={extraFilter}
// //         customFilterComponent={
// //           <TaskAssignmentFilter
// //             selectedProjectIds={selectedProjectIds}
// //             onSelectionChange={handleSelectionChange}
// //             selectedUsers={selectedUsers}
// //             selectedTeams={selectedTeams}
// //           />
// //         }
// //         customFilterItems={customFilterItems}
// //         onCustomFilterItemRemove={handleDeselectItem}
// //         kanbanOptions={{
// //           enabled: true,
// //           groupedData: groupedTasks,
// //           columns: taskStatuses.map((status) => ({
// //             id: status.id,
// //             title: status.name,
// //           })),
// //           cardRender: (item) => <TaskKanbanCard item={item} />,
// //           onCardDrop: handleCardDrop,
// //         }}
// //       />
// //     </div>
// //   );
// // }
