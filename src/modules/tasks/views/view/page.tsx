// مسیر فایل: src/modules/tasks/views/view/page.tsx

"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailPageWrapper } from "@/@Client/Components/wrappers";
// import { useChat } from "@/modules/chat/hooks/useChat"; // Removed: Chat module deprecated
import CommentsThread from "@/modules/comments/components/Thread";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTask } from "../../hooks/useTask";
import { TaskWithRelations } from "../../types";

export default function DetailPage() {
  const params = useParams() as { id?: string } | null;
  const id = Number(params?.id);
  const router = useRouter();
  const { getById, loading, error, statusCode, remove } = useTask();
  const [task, setTask] = useState<TaskWithRelations | null>(null);
  // const { repo: chatRepo } = useChat(); // Removed: Chat module deprecated

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
        پروژه: task.project?.name || "-",
        توضیحات: task.description || "-",
        وضعیت: task.status?.name || "-",
        اولویت: task.priority || "-",
        "تاریخ شروع": task.startDate
          ? new Date(task.startDate).toLocaleDateString("fa-IR")
          : "-",
        "تاریخ پایان": task.endDate
          ? new Date(task.endDate).toLocaleDateString("fa-IR")
          : "-",
        مسئولین:
          task.assignedUsers
            ?.map((u) => u.displayName || u.user.name)
            .join(", ") || "ندارد",
      }
    : {};

  if (!id) return <NotFound />;
  if (loading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <>
      <DetailPageWrapper
        data={displayData}
        title="جزئیات وظیفه"
        loading={loading}
        error={error}
        onDelete={() => handleDelete(task)}
        editUrl={`/dashboard/tasks/${id}/update`}
      />
      <div className="p-4 space-y-4">
        <CommentsThread entityType="Task" entityId={Number(id)} />
        {/* TODO: Add internal-chat link for this task */}
      </div>
    </>
  );
}

export function TaskDetailWithComments() {
  const params = useParams() as unknown as { id?: string };
  const id = Number(params?.id);
  return (
    <div>
      <DetailPage />
    </div>
  );
}
