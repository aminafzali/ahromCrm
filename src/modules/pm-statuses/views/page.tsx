// // مسیر فایل: src/modules/pm-statuses/views/page.tsx
"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import { usePMStatus } from "@/modules/pm-statuses/hooks/usePMStatus";
import { PMStatusWithRelations } from "@/modules/pm-statuses/types";
import { useProject } from "@/modules/projects/hooks/useProject";
import { ProjectWithRelations } from "@/modules/projects/types";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "ndui-ahrom";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

// کامپوننت برای هر آیتم قابل جابجایی
const SortableStatusItem = ({ status }: { status: PMStatusWithRelations }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: status.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center justify-between p-4 mb-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-transparent hover:border-blue-500 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center gap-2">
        <div className="p-2 text-gray-500 dark:text-gray-400">
          <DIcon icon="fa-grip-vertical" />
        </div>
        <span
          className="px-3 py-1 text-sm font-semibold rounded-full text-white"
          style={{ backgroundColor: status.color }}
        >
          {status.name}
        </span>
        {status.project && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({status.project.name})
          </span>
        )}
      </div>
      <Link href={`/dashboard/pm-statuses/${status.id}/update`}>
        <Button variant="ghost" size="sm">
          ویرایش
        </Button>
      </Link>
    </div>
  );
};

// کامپوننت برای نمایش پروژه قابل کلیک
const ProjectCard = ({
  project,
  isSelected,
  onClick,
}: {
  project: ProjectWithRelations;
  isSelected: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 mb-3 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? "bg-primary text-white border-primary shadow-md"
          : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-primary hover:shadow-md"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DIcon
            icon="fa-project-diagram"
            className={isSelected ? "text-white" : "text-gray-500"}
          />
          <div>
            <h3
              className={`font-semibold ${
                isSelected ? "text-white" : "text-gray-800 dark:text-gray-200"
              }`}
            >
              {project.name}
            </h3>
            {project.description && (
              <p
                className={`text-xs mt-1 ${
                  isSelected
                    ? "text-white/80"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {project.description.substring(0, 50)}
                {project.description.length > 50 ? "..." : ""}
              </p>
            )}
          </div>
        </div>
        {isSelected && <DIcon icon="fa-check-circle" className="text-white" />}
      </div>
    </div>
  );
};

// کامپوننت اصلی صفحه
export default function CustomizeStatusesPage() {
  const { getAll, reorder, loading } = usePMStatus();
  const { getAll: getAllProjects, loading: loadingProjects } = useProject();
  const [allStatuses, setAllStatuses] = useState<PMStatusWithRelations[]>([]);
  const [projects, setProjects] = useState<ProjectWithRelations[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

  // بارگذاری همه وضعیت‌ها و پروژه‌ها
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusesResult, projectsResult] = await Promise.all([
          getAll({
            page: 1,
            limit: 500,
            orderBy: "order",
            orderDirection: "asc",
          }),
          getAllProjects({
            page: 1,
            limit: 1000,
          }),
        ]);
        setAllStatuses(statusesResult.data || []);
        setProjects(projectsResult.data || []);
      } catch (error) {
        toast.error("خطا در دریافت داده‌ها");
      }
    };
    fetchData();
  }, []);

  // فیلتر کردن وضعیت‌ها بر اساس انتخاب
  const { globalTaskStatuses, globalProjectStatuses, projectSpecificStatuses } =
    useMemo(() => {
      const globalTasks = allStatuses.filter(
        (s) => s.type === "TASK" && !s.project?.id
      );
      const globalProjects = allStatuses.filter(
        (s) => s.type === "PROJECT" && !s.project?.id
      );
      const projectSpecific =
        selectedProjectId !== null
          ? allStatuses.filter(
              (s) => s.type === "TASK" && s.project?.id === selectedProjectId
            )
          : [];

      // مرتب‌سازی بر اساس order
      const sortByOrder = (
        a: PMStatusWithRelations,
        b: PMStatusWithRelations
      ) => (a.order ?? 0) - (b.order ?? 0);

      return {
        globalTaskStatuses: globalTasks.sort(sortByOrder),
        globalProjectStatuses: globalProjects.sort(sortByOrder),
        projectSpecificStatuses: projectSpecific.sort(sortByOrder),
      };
    }, [allStatuses, selectedProjectId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // مدیریت drag & drop برای وضعیت‌های کلی وظایف
  const handleGlobalTaskDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = globalTaskStatuses.findIndex((s) => s.id === active.id);
      const newIndex = globalTaskStatuses.findIndex((s) => s.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(globalTaskStatuses, oldIndex, newIndex);
        // به‌روزرسانی همه وضعیت‌ها با حفظ سایر وضعیت‌ها
        setAllStatuses((prev) => {
          const otherStatuses = prev.filter(
            (s) => !(s.type === "TASK" && !s.project?.id)
          );
          return [...otherStatuses, ...reordered];
        });
        handleSaveChangesForList(reordered);
      }
    }
  };

  // مدیریت drag & drop برای وضعیت‌های کلی پروژه‌ها
  const handleGlobalProjectDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = globalProjectStatuses.findIndex(
        (s) => s.id === active.id
      );
      const newIndex = globalProjectStatuses.findIndex((s) => s.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(globalProjectStatuses, oldIndex, newIndex);
        // به‌روزرسانی همه وضعیت‌ها با حفظ سایر وضعیت‌ها
        setAllStatuses((prev) => {
          const otherStatuses = prev.filter(
            (s) => !(s.type === "PROJECT" && !s.project?.id)
          );
          return [...otherStatuses, ...reordered];
        });
        handleSaveChangesForList(reordered);
      }
    }
  };

  // مدیریت drag & drop برای وضعیت‌های خاص پروژه
  const handleProjectSpecificDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && selectedProjectId !== null) {
      const oldIndex = projectSpecificStatuses.findIndex(
        (s) => s.id === active.id
      );
      const newIndex = projectSpecificStatuses.findIndex(
        (s) => s.id === over.id
      );
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(
          projectSpecificStatuses,
          oldIndex,
          newIndex
        );
        // به‌روزرسانی همه وضعیت‌ها با حفظ سایر وضعیت‌ها
        setAllStatuses((prev) => {
          const otherStatuses = prev.filter(
            (s) => !(s.type === "TASK" && s.project?.id === selectedProjectId)
          );
          return [...otherStatuses, ...reordered];
        });
        handleSaveChangesForList(reordered);
      }
    }
  };

  // ذخیره تغییرات برای یک لیست خاص
  const handleSaveChangesForList = async (
    statusList: PMStatusWithRelations[]
  ) => {
    setIsSaving(true);
    try {
      const updatedOrder = statusList.map((status, index) => ({
        id: status.id,
        order: index,
      }));
      await reorder(updatedOrder);
      // بارگذاری مجدد برای اطمینان از هماهنگی
      const result = await getAll({
        page: 1,
        limit: 500,
        orderBy: "order",
        orderDirection: "asc",
      });
      setAllStatuses(result.data || []);
    } catch (error) {
      toast.error("خطا در ذخیره ترتیب");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  if (loading && allStatuses.length === 0) return <Loading />;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">سفارشی‌سازی وضعیت‌ها</h1>
        <Link href="/dashboard/pm-statuses/create">
          <Button variant="primary" outline>
            <DIcon icon="fa-plus" className="ml-2" />
            ایجاد وضعیت جدید
          </Button>
        </Link>
      </div>

      <p className="mb-6 text-gray-600 dark:text-gray-400">
        در این بخش می‌توانید وضعیت‌های کلی و وضعیت‌های خاص هر پروژه را مدیریت
        کنید. ترتیب نمایش وضعیت‌ها را با کشیدن و رها کردن مشخص کنید.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ستون سمت راست: لیست پروژه‌ها */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 sticky top-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DIcon icon="fa-folder-open" />
              وضعیت کلی
            </h2>
            <button
              onClick={() => setSelectedProjectId(null)}
              className={`w-full p-3 mb-3 rounded-lg border text-right transition-all ${
                selectedProjectId === null
                  ? "bg-primary text-white border-primary shadow-md"
                  : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 hover:border-primary"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">همه پروژه‌ها</span>
                {selectedProjectId === null && (
                  <DIcon icon="fa-check-circle" className="text-white" />
                )}
              </div>
              <p className="text-xs mt-1 opacity-80">
                وضعیت‌های کلی برای همه پروژه‌ها
              </p>
            </button>

            <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4">
              <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
                <DIcon icon="fa-project-diagram" />
                وضعیت‌های خاص پروژه‌ها
              </h3>
              <div className="max-h-[600px] overflow-y-auto">
                {projects.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    پروژه‌ای یافت نشد
                  </p>
                ) : (
                  projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      isSelected={selectedProjectId === project.id}
                      onClick={() => setSelectedProjectId(project.id)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ستون سمت چپ: نمایش وضعیت‌ها */}
        <div className="lg:col-span-2">
          {selectedProjectId === null ? (
            // نمایش وضعیت‌های کلی
            <DndContext sensors={sensors} collisionDetection={closestCenter}>
              <div className="space-y-6">
                {/* وضعیت‌های کلی وظایف */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <DIcon icon="fa-tasks" />
                    وضعیت‌های کلی وظایف
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    این وضعیت‌ها برای همه وظایف در همه پروژه‌ها اعمال می‌شوند.
                  </p>
                  {globalTaskStatuses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <DIcon icon="fa-info-circle" className="text-4xl mb-2" />
                      <p>هیچ وضعیت کلی وظایفی وجود ندارد</p>
                      <Link href="/dashboard/pm-statuses/create">
                        <Button variant="ghost" size="sm" className="mt-2">
                          ایجاد وضعیت جدید
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleGlobalTaskDragEnd}
                    >
                      <SortableContext
                        items={globalTaskStatuses.map((s) => s.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {globalTaskStatuses.map((status) => (
                          <SortableStatusItem key={status.id} status={status} />
                        ))}
                      </SortableContext>
                    </DndContext>
                  )}
                </div>

                {/* وضعیت‌های کلی پروژه‌ها */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <DIcon icon="fa-project-diagram" />
                    وضعیت‌های کلی پروژه‌ها
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    این وضعیت‌ها برای همه پروژه‌ها اعمال می‌شوند.
                  </p>
                  {globalProjectStatuses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <DIcon icon="fa-info-circle" className="text-4xl mb-2" />
                      <p>هیچ وضعیت کلی پروژه‌ای وجود ندارد</p>
                      <Link href="/dashboard/pm-statuses/create">
                        <Button variant="ghost" size="sm" className="mt-2">
                          ایجاد وضعیت جدید
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleGlobalProjectDragEnd}
                    >
                      <SortableContext
                        items={globalProjectStatuses.map((s) => s.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {globalProjectStatuses.map((status) => (
                          <SortableStatusItem key={status.id} status={status} />
                        ))}
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
              </div>
            </DndContext>
          ) : (
            // نمایش وضعیت‌های خاص پروژه انتخاب شده
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <DIcon icon="fa-project-diagram" />
                    وضعیت‌های خاص پروژه: {selectedProject?.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    این وضعیت‌ها فقط برای وظایف پروژه &quot;
                    {selectedProject?.name}&quot; اعمال می‌شوند.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProjectId(null)}
                >
                  <DIcon icon="fa-times" className="ml-2" />
                  بستن
                </Button>
              </div>

              {projectSpecificStatuses.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <DIcon icon="fa-info-circle" className="text-4xl mb-3" />
                  <p className="mb-2">
                    هیچ وضعیت خاصی برای این پروژه تعریف نشده است.
                  </p>
                  <Link href="/dashboard/pm-statuses/create">
                    <Button variant="primary" outline className="mt-2">
                      <DIcon icon="fa-plus" className="ml-2" />
                      ایجاد وضعیت خاص برای این پروژه
                    </Button>
                  </Link>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleProjectSpecificDragEnd}
                >
                  <SortableContext
                    items={projectSpecificStatuses.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {projectSpecificStatuses.map((status) => (
                      <SortableStatusItem key={status.id} status={status} />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


