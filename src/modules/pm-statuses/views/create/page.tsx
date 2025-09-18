// // مسیر فایل: src/modules/pm-statuses/views/create/page.tsx
"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import { usePMStatus } from "@/modules/pm-statuses/hooks/usePMStatus";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
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
import { PMStatus } from "@prisma/client";
import { Button } from "ndui-ahrom";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// کامپوننت برای هر آیتم قابل جابجایی
const SortableStatusItem = ({ status }: { status: PMStatus }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: status.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center justify-between p-4 mb-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-transparent hover:border-blue-500"
    >
      <div className="flex items-center">
        <div
          {...listeners}
          className="cursor-grab p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          <DIcon icon="fa-grip-vertical" />
        </div>
        <span
          className="px-3 py-1 text-sm font-semibold rounded-full text-white"
          style={{ backgroundColor: status.color }}
        >
          {status.name}
        </span>
      </div>
      <Link href={`/dashboard/pm-statuses/${status.id}/update`}>
        <Button variant="ghost" size="sm">
          ویرایش
        </Button>
      </Link>
    </div>
  );
};

// کامپوننت اصلی صفحه
export default function CustomizeStatusesPage() {
  const { getAll, reorder, loading } = usePMStatus();
  const [statuses, setStatuses] = useState<PMStatus[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const result = await getAll({
          page: 1,
          limit: 500,
          orderBy: "order",
          orderDirection: "asc",
        });
        setStatuses(result.data);
      } catch (error) {
        toast.error("خطا در دریافت لیست وضعیت‌ها");
      }
    };
    fetchStatuses();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setStatuses((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const taskStatuses = statuses.filter((s) => s.type === "TASK");
  const projectStatuses = statuses.filter((s) => s.type === "PROJECT");

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const updatedOrder = statuses.map((status, index) => ({
        id: status.id,
        order: index,
      }));
      await reorder(updatedOrder);
    } catch (error) {
      // خطا توسط هوک مدیریت می‌شود
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && statuses.length === 0) return <Loading />;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">سفارشی‌سازی وضعیت‌ها</h1>
        <div>
          <Button
            onClick={handleSaveChanges}
            loading={isSaving}
            className="ml-2"
          >
            ذخیره تغییرات
          </Button>
          <Link href="/dashboard/pm-statuses/create">
            <Button variant="primary" outline>
              ایجاد وضعیت جدید
            </Button>
          </Link>
        </div>
      </div>

      <p className="mb-8 text-gray-600 dark:text-gray-400">
        در این بخش می‌توانید ترتیب نمایش وضعیت‌ها در برد کانبان و سایر بخش‌های
        نرم‌افزار را با کشیدن و رها کردن مشخص کنید.
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">وضعیت‌های وظایف</h2>
            <SortableContext
              items={taskStatuses.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {taskStatuses.map((status) => (
                <SortableStatusItem key={status.id} status={status} />
              ))}
            </SortableContext>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">وضعیت‌های پروژه‌ها</h2>
            <SortableContext
              items={projectStatuses.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {projectStatuses.map((status) => (
                <SortableStatusItem key={status.id} status={status} />
              ))}
            </SortableContext>
          </div>
        </div>
      </DndContext>
    </div>
  );
}

// "use client";
// import { CreateWrapper } from "@/@Client/Components/wrappers";
// import { CreatePageProps } from "@/@Client/types/crud";
// import { getCreateFormConfig } from "../../data/form";
// import { PMStatusRepository } from "../../repo/PMStatusRepository";
// import { createPMStatusSchema } from "../../validation/schema";

// export default function CreatePage({ back = true, after }: CreatePageProps) {
//   return (
//     <CreateWrapper
//       title="ایجاد وضعیت جدید"
//       backUrl={back}
//       after={after}
//       formConfig={getCreateFormConfig}
//       repo={new PMStatusRepository()}
//       schema={createPMStatusSchema}
//     />
//   );
// }
