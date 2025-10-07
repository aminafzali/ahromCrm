// مسیر فایل: src/modules/tasks/views/view/page.tsx

"use client";

import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailPageWrapper } from "@/@Client/Components/wrappers";
import { useChat } from "@/modules/chat/hooks/useChat";
import CommentsThread from "@/modules/comments/components/Thread";
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
  const { repo: chatRepo } = useChat();

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
      <div className="p-4">
        <button
          className="btn btn-outline"
          onClick={async () => {
            const roomName = `Task#${id}`;
            const found: any = await chatRepo.getAll({
              page: 1,
              limit: 1,
              filters: { name: roomName },
            });
            const existing = found?.data?.[0];
            if (existing?.id) {
              router.push(`/dashboard/chat/${existing.id}`);
              return;
            }
            const created: any = await chatRepo.create({ name: roomName });
            const newId = created?.data?.id || created?.id;
            if (newId) router.push(`/dashboard/chat/${newId}`);
          }}
        >
          گفتگو برای این تسک
        </button>
      </div>
    </>
  );
}

export function TaskDetailWithComments() {
  const params = useParams();
  const id = parseInt(params.id as string);
  return (
    <div>
      <DetailPage />
      {id && (
        <div className="p-4">
          <CommentsThread entityType="Task" entityId={Number(id)} />
        </div>
      )}
    </div>
  );
}
