"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import CommentsThread from "@/modules/comments/components/Thread";
import DocumentCreateForm from "@/modules/documents/components/DocumentCreateForm";
import FileViewer from "@/modules/documents/components/FileViewer";
import { useDocument } from "@/modules/documents/hooks/useDocument";
import { DocumentWithRelations } from "@/modules/documents/types";
import { Button, Modal } from "ndui-ahrom";
import Link from "next/link";
import {
  Fragment,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTask } from "../hooks/useTask";
import { TaskWithRelations } from "../types";

interface TaskDetailPanelProps {
  taskId: number;
  variant?: "page" | "modal";
  onClose?: () => void;
  onDeleted?: () => void;
  showComments?: boolean;
}

const infoItem = (label: string, value?: ReactNode) => (
  <div className="flex flex-col gap-1 min-w-[120px]">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-sm font-medium text-slate-700 dark:text-slate-100">
      {value ?? "-"}
    </span>
  </div>
);

const getAssignmentLabel = (task?: TaskWithRelations | null) => {
  if (!task) return null;
  const users =
    task.assignedUsers
      ?.map((u) => u.displayName || u.user?.name)
      .filter(Boolean) || [];
  const teams =
    task.assignedTeams?.map((team) => `تیم ${team.name}`).filter(Boolean) || [];
  const combined = [...users, ...teams];
  return combined.length ? combined.join("، ") : null;
};

export default function TaskDetailPanel({
  taskId,
  variant = "page",
  onClose,
  onDeleted,
  showComments,
}: TaskDetailPanelProps) {
  const isModal = variant === "modal";
  const shouldShowComments = showComments ?? !isModal;

  const { getById, loading, error, remove } = useTask();
  const { getAll: getDocuments, update: updateDocument } = useDocument();

  const [task, setTask] = useState<TaskWithRelations | null>(null);
  const [attachments, setAttachments] = useState<DocumentWithRelations[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [availableDocs, setAvailableDocs] = useState<DocumentWithRelations[]>(
    []
  );
  const [availableLoading, setAvailableLoading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentWithRelations | null>(
    null
  );

  const fetchDetails = useCallback(async () => {
    if (!taskId) return;
    const data = await getById(taskId);
    if (data) {
      setTask(data);
    }
  }, [getById, taskId]);

  // Helper function to load attachments (used by handlers)
  const loadAttachments = useCallback(async () => {
    if (!taskId) return;
    setDocsLoading(true);
    try {
      const res = await getDocuments({
        page: 1,
        limit: 100,
        filters: {
          taskId,
        },
      });
      const allDocs: DocumentWithRelations[] = res?.data || [];
      const filtered = allDocs.filter((doc) => doc.taskId === taskId);
      setAttachments(filtered);
    } finally {
      setDocsLoading(false);
    }
  }, [getDocuments, taskId]);

  const loadAvailableDocs = useCallback(async () => {
    setAvailableLoading(true);
    try {
      const res = await getDocuments({
        page: 1,
        limit: 100,
        filters: { taskId: null },
      });
      const list = (res?.data || []).filter(
        (doc) => doc.taskId === null || doc.taskId === undefined
      );
      setAvailableDocs(list);
    } finally {
      setAvailableLoading(false);
    }
  }, [getDocuments]);

  const handleAttachExisting = async (docId: number) => {
    await updateDocument(docId, {
      entityType: "Task",
      entityId: taskId,
      task: { id: taskId },
    });
    await loadAttachments();
    setShowSelectModal(false);
  };

  const handleDetach = useCallback(
    async (docId: number) => {
      await updateDocument(docId, {
        entityType: null,
        entityId: null,
        task: null,
      });
      await loadAttachments();
    },
    [loadAttachments, updateDocument]
  );

  const handleDelete = useCallback(async () => {
    await remove(taskId);
    onDeleted?.();
  }, [remove, taskId, onDeleted]);

  // Load task details and attachments only when taskId changes
  useEffect(() => {
    if (!taskId) return;

    let cancelled = false;

    const loadData = async () => {
      // Load task details
      const taskData = await getById(taskId);
      if (!cancelled && taskData) {
        setTask(taskData);
      }

      // Load attachments
      if (!cancelled) {
        setDocsLoading(true);
      }
      try {
        const res = await getDocuments({
          page: 1,
          limit: 100,
          filters: {
            taskId,
          },
        });
        if (!cancelled) {
          const allDocs: DocumentWithRelations[] = res?.data || [];
          const filtered = allDocs.filter((doc) => doc.taskId === taskId);
          setAttachments(filtered);
          setDocsLoading(false);
        }
      } catch (error) {
        console.error("[TaskDetailPanel] Error loading attachments:", error);
        if (!cancelled) {
          setAttachments([]);
          setDocsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
    // Only depend on taskId to avoid infinite loops
    // getById and getDocuments are stable but may cause re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const assignmentLabel = getAssignmentLabel(task);

  const detailBadges = useMemo(
    () => [
      {
        label: "وضعیت کلی",
        value: task?.status?.name || "نامشخص",
      },
      {
        label: "وضعیت پروژه",
        value: task?.projectStatus?.name || "بدون وضعیت پروژه",
      },
      {
        label: "اولویت",
        value:
          task?.priority === "high"
            ? "زیاد"
            : task?.priority === "medium"
            ? "متوسط"
            : "کم",
      },
    ],
    [task?.priority, task?.projectStatus?.name, task?.status?.name]
  );

  const renderThumbnail = (doc: DocumentWithRelations, size = 56) => {
    if (doc.url && doc.mimeType?.startsWith("image/")) {
      return (
        <img
          src={doc.url}
          alt={doc.originalName || "فایل"}
          className="rounded-lg object-cover bg-slate-100 border border-slate-200"
          style={{ width: size, height: size }}
        />
      );
    }
    return (
      <div
        className="flex items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-500"
        style={{ width: size, height: size }}
      >
        <DIcon icon="fa-file" />
      </div>
    );
  };

  if (loading && !task) {
    return (
      <div className="p-6">
        <Loading />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-6">
        <NotFound />
      </div>
    );
  }

  return (
    <div
      className={`space-y-4 ${
        isModal ? "max-h-[80vh] overflow-y-auto p-1" : "p-4"
      }`}
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1 flex-1 min-w-[240px]">
            <p className="text-xs uppercase text-gray-400">
              {task.project?.name || "بدون پروژه"}
            </p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {task.title}
            </h1>
            {task.description && (
              <p className="text-sm text-gray-500">
                {task.description.replace(/<[^>]+>/g, "").slice(0, 180)}
                {task.description.length > 180 && "…"}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {isModal && (
              <Button size="sm" variant="ghost" onClick={onClose}>
                <DIcon icon="fa-xmark" className="ml-1" />
                بستن
              </Button>
            )}
            {!isModal && (
              <Fragment>
                <Link
                  href={`/dashboard/tasks/${taskId}/update`}
                  className="btn btn-sm bg-slate-900 text-white hover:bg-slate-700"
                >
                  <DIcon icon="fa-pen-to-square" className="ml-1" />
                  ویرایش
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600"
                  onClick={handleDelete}
                >
                  <DIcon icon="fa-trash-can" className="ml-1" />
                  حذف
                </Button>
              </Fragment>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {detailBadges.map((badge) => (
            <span
              key={badge.label}
              className="px-3 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-100"
            >
              {badge.label}: {badge.value}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 space-y-3 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            توضیحات
          </h3>
          {task.description ? (
            <div
              className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-slate-900"
              dangerouslySetInnerHTML={{ __html: task.description }}
            />
          ) : (
            <p className="text-sm text-gray-500">توضیحاتی ثبت نشده است.</p>
          )}
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 space-y-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            اطلاعات
          </h3>
          <div className="flex flex-col gap-4">
            {infoItem(
              "پروژه",
              task.project?.name || <span className="text-gray-400">---</span>
            )}
            {infoItem(
              "مسئولین",
              assignmentLabel || <span className="text-gray-400">--- </span>
            )}
            <div className="grid grid-cols-2 gap-3">
              {infoItem(
                "تاریخ شروع",
                task.startDate
                  ? new Date(task.startDate).toLocaleDateString("fa-IR")
                  : "---"
              )}
              {infoItem(
                "تاریخ پایان",
                task.endDate
                  ? new Date(task.endDate).toLocaleDateString("fa-IR")
                  : "---"
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            فایل‌ها و اسناد
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setShowSelectModal(true);
                loadAvailableDocs();
              }}
            >
              انتخاب از اسناد
            </Button>
            <Button
              size="sm"
              onClick={() => setShowUploadModal(true)}
              icon={<DIcon icon="fa-upload" cdi={false} classCustom="ml-1" />}
            >
              افزودن فایل جدید
            </Button>
          </div>
        </div>
        {docsLoading ? (
          <p className="text-sm text-gray-500">در حال بارگذاری...</p>
        ) : attachments.length === 0 ? (
          <p className="text-sm text-gray-500">
            هنوز فایلی برای این وظیفه ثبت نشده است.
          </p>
        ) : (
          <div className="space-y-3">
            {attachments.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-wrap items-center gap-3 border border-gray-200 dark:border-slate-700 rounded-lg p-3 flex-row-reverse text-right"
              >
                {renderThumbnail(doc)}
                <div className="flex-1 min-w-[200px]">
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    {doc.originalName}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {doc.mimeType || "نامشخص"}
                    {doc.size
                      ? ` · ${(Number(doc.size) / 1024).toFixed(1)} KB`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {doc.url && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setPreviewDoc(doc)}
                    >
                      مشاهده
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => handleDetach(doc.id)}
                  >
                    حذف اتصال
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {shouldShowComments && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-4">
          <CommentsThread entityType="Task" entityId={taskId} />
        </div>
      )}

      {showUploadModal && (
        <Modal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          title="افزودن سند"
        >
          <DocumentCreateForm
            defaultValues={{ entityType: "Task", entityId: taskId, taskId }}
            onCreated={() => {
              setShowUploadModal(false);
              loadAttachments();
            }}
            onError={() => setShowUploadModal(false)}
          />
        </Modal>
      )}

      {showSelectModal && (
        <Modal
          isOpen={showSelectModal}
          onClose={() => setShowSelectModal(false)}
          title="انتخاب سند موجود"
        >
          {availableLoading ? (
            <p className="text-sm text-gray-500">در حال بارگذاری...</p>
          ) : availableDocs.length === 0 ? (
            <p className="text-sm text-gray-500">
              سندی برای انتخاب وجود ندارد.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-gray-200 dark:border-slate-700 rounded-lg p-3 flex gap-3 items-center flex-row-reverse text-right"
                >
                  {renderThumbnail(doc, 64)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2 break-words">
                      {doc.originalName}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {doc.mimeType || "-"}
                      {doc.size
                        ? ` · ${(Number(doc.size) / 1024).toFixed(1)} KB`
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleAttachExisting(doc.id)}
                    >
                      انتخاب
                    </Button>
                    {doc.url && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPreviewDoc(doc)}
                      >
                        مشاهده
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {previewDoc && previewDoc.url && (
        <FileViewer
          url={previewDoc.url}
          mimeType={previewDoc.mimeType || ""}
          fileName={previewDoc.originalName || "فایل"}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}
