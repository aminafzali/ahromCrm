"use client";

import NotFound from "@/@Client/Components/common/NotFound";
import { useParams, useRouter } from "next/navigation";
import TaskDetailPanel from "../../components/TaskDetailPanel";

export default function DetailPage() {
  const params = useParams() as { id?: string } | null;
  const id = Number(params?.id);
  const router = useRouter();

  if (!id) return <NotFound />;

  return (
    <TaskDetailPanel
      taskId={id}
      variant="page"
      onDeleted={() => router.push("/dashboard/tasks")}
    />
  );
}
