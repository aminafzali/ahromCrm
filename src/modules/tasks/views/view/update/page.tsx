// مسیر فایل: src/modules/tasks/views/view/update/page.tsx

"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import { useDocument } from "@/modules/documents/hooks/useDocument";
import { DocumentWithRelations } from "@/modules/documents/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import TaskForm from "../../../components/TaskForm2";
import { useTask } from "../../../hooks/useTask";
import { TaskWithRelations } from "../../../types";

interface UpdateTaskPageProps {
  isAdmin?: boolean;
  backUrl?: boolean;
  backLabel?: string;
}

export default function UpdatePage({
  isAdmin = true,
  backUrl = true,
  backLabel = "بازگشت به لیست وظایف",
}: UpdateTaskPageProps) {
  const params = useParams() as { id?: string };
  const id = Number(params?.id);
  const router = useRouter();
  const { getById, update, submitting, error } = useTask();
  const [task, setTask] = useState<TaskWithRelations | null>(null);
  const [fetching, setFetching] = useState(true);
  const getByIdRef = useRef(getById);
  const { update: updateDocument } = useDocument();
  const [initialAttachments, setInitialAttachments] = useState<
    DocumentWithRelations[]
  >([]);

  useEffect(() => {
    getByIdRef.current = getById;
  }, [getById]);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setFetching(true);
    const fetchTask = async () => {
      try {
        const data = await getByIdRef.current(id);
        if (mounted && data) {
          const typed = data as TaskWithRelations;
          setTask(typed);
          setInitialAttachments(typed.documents || []);
        }
      } finally {
        if (mounted) setFetching(false);
      }
    };
    fetchTask();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSubmit = async (
    formData: any,
    attachments: DocumentWithRelations[]
  ) => {
    if (!id) return;
    const result: any = await update(id, formData);
    if (result?.data?.id) {
      const initialIds = initialAttachments.map((doc) => doc.id);
      const newIds = attachments.map((doc) => doc.id);
      const toAdd = newIds.filter((docId) => !initialIds.includes(docId));
      const toRemove = initialIds.filter((docId) => !newIds.includes(docId));

      if (toAdd.length || toRemove.length) {
        await Promise.all([
          ...toAdd.map((docId) =>
            updateDocument(docId, {
              task: { id },
              entityType: "Task",
              entityId: id,
            })
          ),
          ...toRemove.map((docId) =>
            updateDocument(docId, {
              task: null,
              entityType: null,
              entityId: null,
            })
          ),
        ]);
        setInitialAttachments(attachments);
      }
      router.push(
        isAdmin
          ? `/dashboard/tasks/${result.data.id}`
          : `/panel/tasks/${result.data.id}`
      );
    } else {
      router.push(isAdmin ? "/dashboard/tasks" : "/panel/tasks");
    }
  };

  useEffect(() => {
    if (!id) setFetching(false);
  }, [id]);

  if (fetching) return <Loading />;
  if (!task) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ویرایش وظیفه</h1>
      {backUrl && (
        <Link
          href={isAdmin ? "/dashboard/tasks" : "/panel/tasks"}
          className="flex justify-start items-center mb-6"
        >
          <button className="btn btn-ghost">
            <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
            {backLabel}
          </button>
        </Link>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <TaskForm
        onSubmit={handleSubmit}
        loading={submitting}
        initialData={task}
        initialAttachments={initialAttachments}
        taskId={task.id}
      />
    </div>
  );
}
