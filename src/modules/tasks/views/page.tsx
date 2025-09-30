// // مسیر: src/modules/tasks/views/page.tsx
"use client";

import DataTableWrapper5, {
  CustomFilterItem,
} from "@/@Client/Components/wrappers/DataTableWrapper5";
import { FilterOption } from "@/@Client/types";
import { usePMStatus } from "@/modules/pm-statuses/hooks/usePMStatus";
import { PMStatus } from "@/modules/pm-statuses/types";
import { useProject } from "@/modules/projects/hooks/useProject";
import { TeamWithRelations } from "@/modules/teams/types";
import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import TaskAssignmentFilter from "../components/TaskAssignmentFilter";
import { PriorityBadge, columnsForAdmin, listItemRender } from "../data/table";
import { useTask } from "../hooks/useTask";
import { TaskWithRelations } from "../types";

/**
 * Task Kanban page
 * - مدیریت گروه‌بندی محلی (groupedTasks)
 * - لاگ‌گذاری مفصل برای اشکال‌زدایی
 * - رفع off-by-one در حرکت رو به پایین داخل همان ستون
 * - هایلایت ستون مقصد در هنگام درگ
 */

/** KLog: helper ساده برای لاگ‌گذاری متمرکز */
const KLog = {
  d: (msg: string, obj?: any) => console.debug("[KANBAN] " + msg, obj ?? ""),
  i: (msg: string, obj?: any) => console.info("[KANBAN] " + msg, obj ?? ""),
  w: (msg: string, obj?: any) => console.warn("[KANBAN] " + msg, obj ?? ""),
  e: (msg: string, obj?: any) => console.error("[KANBAN] " + msg, obj ?? ""),
};

const TaskKanbanCard = ({
  item,
  isDragging,
  isActivatable,
}: {
  item: TaskWithRelations;
  isDragging?: boolean;
  isActivatable?: boolean;
}) => {
  // لاگ برای دیباگ (غیرفعال شده)
  // if (isActivatable || isDragging) {
  //   console.log("[TaskKanbanCard] 🎨 Rendering:", {
  //     title: item.title,
  //     isDragging,
  //     isActivatable,
  //   });
  // }

  // تشخیص موبایل برای اضافه کردن فضای سمت راست به عنوان
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div
      className={`p-3 bg-white dark:bg-slate-700 rounded-lg border transition-all ${
        isDragging
          ? "border-2 border-teal-600 dark:border-teal-500 shadow-2xl"
          : isActivatable
          ? "border-2 border-teal-500/60 dark:border-teal-400/60 shadow-lg"
          : "border-gray-200 dark:border-slate-600 shadow-sm hover:shadow-md"
      }`}
    >
      <h4
        className={`font-bold text-md mb-2 text-slate-800 dark:text-slate-100 ${
          isMobile ? "pr-10" : ""
        }`}
      >
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
};

type GroupedTasks = Record<string, TaskWithRelations[]>;

export default function IndexPage({ title = "مدیریت وظایف" }) {
  const { getAll, update, loading, error } = useTask();
  const { getAll: getAllStatuses, loading: loadingStatuses } = usePMStatus();
  const { getAll: getAllProjects, loading: loadingProjects } = useProject();

  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [groupedTasks, setGroupedTasks] = useState<GroupedTasks>({});

  const [taskStatuses, setTaskStatuses] = useState<PMStatus[]>([]);
  const [userProjects, setUserProjects] = useState<
    { label: string; value: number }[]
  >([]);
  const [selectedUsers, setSelectedUsers] = useState<
    WorkspaceUserWithRelations[]
  >([]);
  const [selectedTeams, setSelectedTeams] = useState<TeamWithRelations[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<
    (string | number)[]
  >([]);

  // ref برای جلوگیری از ارسال همزمان چند PATCH روی یک آیتم
  const pendingRef = useRef<Set<string>>(new Set());
  // ref برای debounce refetch کلی (در صورت نیاز)
  const refetchTimerRef = useRef<any>(null);

  useEffect(() => {
    getAllStatuses({ page: 1, limit: 200, type: "TASK" }).then((res) => {
      const list = res.data || [];
      // مرتب‌سازی بر اساس فیلد order در مدل PMStatus
      list.sort((a: PMStatus, b: PMStatus) => (a.order ?? 0) - (b.order ?? 0));
      setTaskStatuses(list);
    });
    getAllProjects({ page: 1, limit: 1000, assignedTo: "me" }).then((res) => {
      const projectsForSelect = (res.data || []).map((p) => ({
        label: p.name,
        value: p.id,
      }));
      setUserProjects(projectsForSelect);
    });
  }, []);

  // گروه‌بندی تسک‌ها براساس statusId — هر بار tasks یا taskStatuses تغییر کرد
  useEffect(() => {
    const groups = taskStatuses.reduce((acc, status) => {
      const statusId = String(status.id);
      acc[statusId] = tasks
        .filter((task) => String(task.statusId) === statusId)
        // اطمینان از اینکه ترتیب داخل ستون بر اساس orderInStatus رعایت می‌شود
        .sort((a, b) => (a.orderInStatus ?? 0) - (b.orderInStatus ?? 0));
      return acc;
    }, {} as GroupedTasks);

    // ستون‌های خالی را هم اضافه کن
    taskStatuses.forEach((s) => {
      if (!groups[String(s.id)]) groups[String(s.id)] = [];
    });

    setGroupedTasks(groups);
  }, [tasks, taskStatuses]);

  const handleSelectionChange = (
    users: WorkspaceUserWithRelations[],
    teams: TeamWithRelations[]
  ) => {
    setSelectedUsers(users);
    setSelectedTeams(teams);
  };

  const handleDeselectItem = (item: CustomFilterItem) => {
    if (item.type === "team")
      setSelectedTeams((prev) => prev.filter((t) => t.id !== item.id));
    if (item.type === "user")
      setSelectedUsers((prev) => prev.filter((u) => u.id !== item.id));
  };

  const extraFilter = useMemo(() => {
    const filters: any = {};
    if (selectedUsers.length > 0)
      filters.assignedUsers_some = selectedUsers.map((u) => u.id).join(",");
    if (selectedTeams.length > 0)
      filters.assignedTeams_some = selectedTeams.map((t) => t.id).join(",");
    return filters;
  }, [selectedUsers, selectedTeams]);

  // fetcher که DataTableWrapper4 از آن استفاده می‌کند
  const fetchData = async (params: any) => {
    const result = await getAll(params);
    if (result.data) {
      setTasks(result.data);
    }
    return result;
  };

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

  const customFilterItems: CustomFilterItem[] = useMemo(
    () => [
      ...selectedTeams.map((t) => ({ id: t.id, name: t.name, type: "team" })),
      ...selectedUsers.map((u) => ({
        id: u.id,
        name: u.displayName ?? u.user.name,
        type: "user",
      })),
    ],
    [selectedTeams, selectedUsers]
  );

  // کمکی: تبدیل یک id پیش‌فرض شده مثل 'task-4' یا 'col-3' به شکل قابل استفاده
  const stripPrefix = (prefixedId?: string | number | null) => {
    if (prefixedId === null || prefixedId === undefined) return null;
    const s = String(prefixedId);
    if (s.startsWith("task-")) return { type: "task", id: s.slice(5) };
    if (s.startsWith("col-")) return { type: "col", id: s.slice(4) };
    // اگر فاقد پیشوند است، احتمالاً همان id خام است => فرض می‌کنیم task
    if (/^\d+$/.test(s)) return { type: "task", id: s };
    return null;
  };

  // Debounced refetch فقط در صورت نیاز (مثلاً اگر سرور داده تفاوت داشت)
  const scheduleRefetch = (delay = 500) => {
    if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
    refetchTimerRef.current = setTimeout(() => {
      KLog.d("debounced refetch triggered");
      fetchData({ page: 1, limit: 1000 });
    }, delay);
  };

  /**
   * handleCardDrop: (بدون تغییر نسبت به قبل)
   * - active.id و over.id با فرمت 'task-<id>' یا 'col-<statusId>' دریافت می‌شوند (از DataTableWrapper5 - Kanban)
   * - منطق optimistic update + ارسال request به سرور + reconcile با جواب سرور
   *
   * اصلاح off-by-one:
   *  - از snapshot اولیه originalGroupedTasks استفاده می‌کنیم تا موقعیت اصلیِ over را بفهمیم.
   *  - اگر از بالاتر به پایین‌تر حرکت می‌کنیم (oldIndex < originalIndexOfOver) داخل همان ستون،
   *    باید newIndex را یک واحد جلوتر بنشانیم تا آیتم "پس از" آیتم مقصد قرار بگیرد.
   */
  const handleCardDrop = (active: any, over: any) => {
    try {
      KLog.d("handleCardDrop called", {
        activeId: active?.id,
        overId: over?.id,
      });

      if (!active || !active.id || !over || !over.id) {
        KLog.w("handleCardDrop: active/over missing — abort");
        return;
      }

      const activeParsed = stripPrefix(active.id);
      const overParsed = stripPrefix(over.id);

      if (!activeParsed || activeParsed.type !== "task") {
        KLog.w("handleCardDrop: activeParsed invalid", { activeParsed });
        return;
      }
      if (!overParsed) {
        KLog.w("handleCardDrop: overParsed invalid", { overParsed });
        return;
      }

      const activeId = String(activeParsed.id);

      // پیدا کردن ستون مبدا (if exists)
      const findContainerOfTask = (taskId: string) => {
        return Object.keys(groupedTasks).find((k) =>
          groupedTasks[k].some((it) => String(it.id) === taskId)
        );
      };
      const fromContainerId = findContainerOfTask(activeId);

      // تعیین ستون مقصد
      let toContainerId: string | undefined;
      if (overParsed.type === "col") {
        toContainerId = String(overParsed.id);
      } else {
        // overParsed.type === 'task' => پیدا کردن ستون شامل آن
        toContainerId = findContainerOfTask(String(overParsed.id));
      }

      if (!toContainerId) {
        KLog.w("handleCardDrop: could not determine destination container", {
          overParsed,
        });
        return;
      }

      // اگر هیچ تغییری نیست -> noop
      if (
        fromContainerId === toContainerId &&
        activeParsed.id === overParsed.id
      ) {
        KLog.d("handleCardDrop: noop — same position");
        return;
      }

      // snapshot برای rollback
      const originalGroupedTasks = JSON.parse(
        JSON.stringify(groupedTasks)
      ) as GroupedTasks;
      const originalTasks = JSON.parse(
        JSON.stringify(tasks)
      ) as TaskWithRelations[];

      const movedTask = originalTasks.find((t) => String(t.id) === activeId);
      if (!movedTask) {
        KLog.e("handleCardDrop: movedTask not found in local tasks", {
          activeId,
        });
        return;
      }

      // ساخت گروه‌بندی جدید (انجام optimistic UI)
      const newGrouped = JSON.parse(
        JSON.stringify(groupedTasks)
      ) as GroupedTasks;
      // ابتدا حذف از همه ستون‌ها (برای جلوگیری از کپی روی duplicate)
      Object.keys(newGrouped).forEach((k) => {
        newGrouped[k] = newGrouped[k].filter(
          (it) => String(it.id) !== activeId
        );
      });

      // محاسبه newIndex در ستون مقصد
      // اگر over یک ستون است => append
      let newIndex: number;
      if (overParsed.type === "col") {
        newIndex = (newGrouped[toContainerId] || []).length;
      } else {
        // overParsed.type === 'task'
        // بعد از حذف active از جدید، اندیس آیتم over را پیدا کن (این اندیس نشان‌دهنده جای BEFORE over است)
        newIndex = newGrouped[toContainerId].findIndex(
          (it) => String(it.id) === String(overParsed.id)
        );
        if (newIndex === -1)
          newIndex = (newGrouped[toContainerId] || []).length;

        // *** FIX off-by-one ***
        if (fromContainerId === toContainerId) {
          const originalDest = originalGroupedTasks[toContainerId] || [];
          const originalOldIndex = originalDest.findIndex(
            (it) => String(it.id) === activeId
          );
          const originalOverIndex = originalDest.findIndex(
            (it) => String(it.id) === String(overParsed.id)
          );
          if (
            originalOldIndex !== -1 &&
            originalOverIndex !== -1 &&
            originalOldIndex < originalOverIndex
          ) {
            newIndex = newIndex + 1;
            KLog.d(
              "off-by-one fix applied: moving down inside same column -> increment newIndex",
              {
                activeId,
                originalOldIndex,
                originalOverIndex,
                adjustedNewIndex: newIndex,
              }
            );
          }
        }
      }

      // درج کپی موقتی کار در مقصد
      const movedCopy = { ...movedTask };
      if (!newGrouped[toContainerId]) newGrouped[toContainerId] = [];
      // clamp newIndex
      if (newIndex < 0) newIndex = 0;
      if (newIndex > newGrouped[toContainerId].length)
        newIndex = newGrouped[toContainerId].length;
      newGrouped[toContainerId].splice(newIndex, 0, movedCopy);

      // محاسبه orderInStatus جدید با نرمی و جلوگیری از clash
      const col = newGrouped[toContainerId];
      const idxInCol = col.findIndex((it) => String(it.id) === activeId);

      let newOrderInStatus: number;
      if (col.length === 1) {
        newOrderInStatus = 1;
      } else if (idxInCol === 0) {
        const next = col[1];
        const nextOrder =
          typeof next?.orderInStatus === "number" ? next.orderInStatus : 2;
        newOrderInStatus = nextOrder / 2;
      } else if (idxInCol === col.length - 1) {
        const before = col[col.length - 2];
        const beforeOrder =
          typeof before?.orderInStatus === "number"
            ? before.orderInStatus
            : col.length - 1;
        newOrderInStatus = beforeOrder + 1;
      } else {
        const prev = col[idxInCol - 1];
        const next = col[idxInCol + 1];
        const prevOrder =
          typeof prev?.orderInStatus === "number"
            ? prev.orderInStatus
            : idxInCol - 1;
        const nextOrder =
          typeof next?.orderInStatus === "number"
            ? next.orderInStatus
            : prevOrder + 2;
        newOrderInStatus = (prevOrder + nextOrder) / 2;
      }

      const payload: any = { orderInStatus: newOrderInStatus };
      if (fromContainerId !== toContainerId) {
        payload.statusId = Number(toContainerId);
      }

      KLog.i("computed move", {
        activeId,
        from: fromContainerId,
        to: toContainerId,
        newIndex,
        newOrderInStatus,
        payload,
      });

      // جلوگیری از ارسال همزمان برای یک آیتم
      if (pendingRef.current.has(activeId)) {
        KLog.w(
          "handleCardDrop: update already pending for this task — skipping",
          { activeId }
        );
        return;
      }

      // optimistic update در state اصلی
      setGroupedTasks(newGrouped);
      setTasks((prev) => {
        // حذف هر مورد قدیمی و افزودن نمونه‌ی محلی به‌روز شده (برای جلوگیری از duplicate)
        const filtered = prev.filter((t) => String(t.id) !== activeId);
        const localUpdated = {
          ...movedTask,
          statusId: payload.statusId ?? movedTask.statusId,
          orderInStatus: newOrderInStatus,
        };
        return [...filtered, localUpdated];
      });

      pendingRef.current.add(activeId);

      // ارسال به سرور
      update(Number(activeId), payload)
        .then((updatedTask: any) => {
          pendingRef.current.delete(activeId);
          KLog.d("update response received", { updatedTask });

          // بعضی endpoints داده را در { data: ... } می‌فرستند؛ این را مدیریت کن
          const serverTask = (updatedTask &&
            (updatedTask.data ?? updatedTask)) as TaskWithRelations;

          if (!serverTask || !serverTask.id) {
            KLog.w(
              "handleCardDrop: server returned invalid updated task -> scheduling refetch",
              { updatedTask }
            );
            scheduleRefetch(400);
            return;
          }

          // مطمئن شویم در tasks فقط یک نمونه داریم (replace not append)
          setTasks((prev) => {
            const filtered = prev.filter(
              (t) => String(t.id) !== String(serverTask.id)
            );
            return [...filtered, serverTask];
          });

          // reconcile groupedTasks بر اساس مقدار واقعی سرور (orderInStatus و statusId)
          setGroupedTasks((prevG) => {
            const g = JSON.parse(JSON.stringify(prevG)) as GroupedTasks;
            // حذف نمونه‌های قدیمی
            Object.keys(g).forEach((k) => {
              g[k] = g[k].filter(
                (it) => String(it.id) !== String(serverTask.id)
              );
            });
            const dest = String(serverTask.statusId);
            if (!g[dest]) g[dest] = [];
            // درج در جای مناسب بر اساس orderInStatus
            const insertIndex = g[dest].findIndex(
              (it) => (it.orderInStatus ?? 0) > (serverTask.orderInStatus ?? 0)
            );
            if (insertIndex === -1) g[dest].push(serverTask);
            else g[dest].splice(insertIndex, 0, serverTask);
            return g;
          });

          KLog.i("task updated successfully on server", {
            serverTaskId: serverTask.id,
          });
        })
        .catch((err) => {
          // rollback
          pendingRef.current.delete(activeId);
          KLog.e("handleCardDrop: update failed - rollback", { err });
          toast.error("خطا در به‌روزرسانی وظیفه — بازگردانی انجام شد");
          setTasks(originalTasks);
          setGroupedTasks(originalGroupedTasks);
          scheduleRefetch(200);
        });
    } catch (e) {
      KLog.e("handleCardDrop unexpected error", e);
    }
  };

  return (
    <div className="w-full">
      <DataTableWrapper5<TaskWithRelations>
        columns={columnsForAdmin}
        createUrl="/dashboard/tasks/create"
        loading={loading || loadingStatuses || loadingProjects}
        error={error}
        title={title}
        fetcher={fetchData}
        filterOptions={filterOptions}
        dateFilterFields={dateFilterFields}
        listItemRender={listItemRender}
        defaultViewMode="kanban"
        extraFilter={extraFilter}
        customFilterComponent={
          <TaskAssignmentFilter
            selectedProjectIds={selectedProjectIds}
            onSelectionChange={handleSelectionChange}
            selectedUsers={selectedUsers}
            selectedTeams={selectedTeams}
          />
        }
        customFilterItems={customFilterItems}
        onCustomFilterItemRemove={handleDeselectItem}
        // ---- ارسال تنظیمات کانبان (توجه: قابلیت تنظیم تاچ سنسور از اینجا)
        kanbanOptions={{
          enabled: true,
          groupedData: groupedTasks,
          // در اینجا رنگ و ترتیب ستون‌ها را پاس می‌کنیم
          columns: taskStatuses.map((status) => ({
            id: status.id,
            title: status.name,
            color: status.color,
            order: status.order,
          })),
          cardRender: (item, isDragging, isActivatable) => (
            <TaskKanbanCard
              item={item}
              isDragging={isDragging}
              isActivatable={isActivatable}
            />
          ),
          onCardDrop: handleCardDrop,
        }}
        kanbanTouchConfig={{
          delay: 250, // ✅ متعادل برای drag و scroll
          tolerance: 8, // ✅ متعادل - اگر بیش از 8px حرکت کرد = اسکرول
          pointerDistance: 6, // حساس‌تر برای pointer
          scrollEdgeThreshold: 60, // فاصله کمتر برای auto-scroll سریع‌تر
          scrollSpeed: 20, // سرعت auto-scroll بیشتر
        }}
      />
    </div>
  );
}
