// مسیر فایل: src/modules/tasks/views/view/page.tsx

"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailPageWrapper } from "@/@Client/Components/wrappers";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTask } from "../../hooks/useTask";
import { TaskWithRelations } from "../../types";

export default function DetailPage() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const router = useRouter();
  const { getById, loading, error, statusCode, remove } = useTask();
  const [task, setTask] = useState<TaskWithRelations | null>(null);

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id]);

  const fetchDetails = async () => {
    const data = await getById(id);
    if (data) {
      setTask(data);
    }
  };

  const handleDelete = async (row: any) => {
    await remove(row.id);
    router.push("/dashboard/tasks");
  };

  const displayData = task
    ? {
        "عنوان وظیفه": task.title,
        "پروژه": task.project?.name || "-",
        "توضیحات": task.description || "-",
        "وضعیت": task.status?.name || "-",
        "اولویت": task.priority || "-",
        "تاریخ شروع": task.startDate
          ? new Date(task.startDate).toLocaleDateString("fa-IR")
          : "-",
        "تاریخ پایان": task.endDate
          ? new Date(task.endDate).toLocaleDateString("fa-IR")
          : "-",
        "مسئولین":
          task.assignedUsers?.map((u) => u.displayName || u.user.name).join(", ") ||
          "ندارد",
      }
    : {};

  if (loading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <DetailPageWrapper
      data={displayData}
      title="جزئیات وظیفه"
      loading={loading}
      error={error}
      onDelete={() => handleDelete(task)}
      editUrl={`/dashboard/tasks/${id}/update`}
    />
  );
}