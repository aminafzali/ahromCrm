"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import DocumentCreateForm from "@/modules/documents/components/DocumentCreateForm";
import FileViewer from "@/modules/documents/components/FileViewer";
import { useDocument } from "@/modules/documents/hooks/useDocument";
import { DocumentWithRelations } from "@/modules/documents/types";
import { Button } from "ndui-ahrom";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface TaskAttachmentsSectionProps {
  value: DocumentWithRelations[];
  onChange: (docs: DocumentWithRelations[]) => void;
  title?: string;
  taskId?: number;
}

export default function TaskAttachmentsSection({
  value,
  onChange,
  title = "فایل‌ها و اسناد",
  taskId,
}: TaskAttachmentsSectionProps) {
  const { getAll: getDocuments } = useDocument();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [availableDocs, setAvailableDocs] = useState<DocumentWithRelations[]>(
    []
  );
  const [previewDoc, setPreviewDoc] = useState<DocumentWithRelations | null>(
    null
  );
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!showSelectModal) {
      setSelectedIds(new Set());
    }
  }, [showSelectModal]);

  const handleRemove = (docId: number) => {
    onChange(value.filter((doc) => doc.id !== docId));
  };

  const handleUploadSuccess = (created: any[]) => {
    console.log("[TASK_ATTACH] handleUploadSuccess called", {
      createdCount: created?.length,
      created,
      currentValueCount: value.length,
      taskId,
    });
    const normalized = (created as DocumentWithRelations[]).filter(
      (doc) => doc && !value.some((item) => item.id === doc.id)
    );
    console.log("[TASK_ATTACH] normalized docs", {
      normalizedCount: normalized.length,
      normalized,
    });
    if (normalized.length) {
      const newValue = [...value, ...normalized];
      console.log("[TASK_ATTACH] calling onChange with new value", {
        newValueCount: newValue.length,
        newValue,
      });
      onChange(newValue);
    }
    setShowUploadModal(false);
  };

  const openSelectModal = async () => {
    setShowSelectModal(true);
    setSelectLoading(true);
    try {
      const res = await getDocuments({
        page: 1,
        limit: 100,
      });
      const docs: DocumentWithRelations[] = (res?.data || []).filter(
        (doc: DocumentWithRelations) =>
          !value.some((item) => item.id === doc.id)
      );
      setAvailableDocs(docs);
    } finally {
      setSelectLoading(false);
    }
  };

  const toggleSelectDoc = (docId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId);
      else next.add(docId);
      return next;
    });
  };

  const handleConfirmSelection = () => {
    if (!selectedIds.size) return;
    const docsToAdd = availableDocs.filter(
      (doc) =>
        selectedIds.has(doc.id) && !value.some((item) => item.id === doc.id)
    );
    if (docsToAdd.length) {
      onChange([...value, ...docsToAdd]);
    }
    setSelectedIds(new Set());
    setShowSelectModal(false);
  };

  const renderThumbnail = (doc: DocumentWithRelations, size = 56) => {
    if (doc.url && doc.mimeType?.startsWith("image/")) {
      return (
        <img
          src={doc.url}
          alt={doc.originalName}
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          {title}
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => openSelectModal()}
          >
            انتخاب سند
          </Button>
          <Button
            size="sm"
            onClick={() => setShowUploadModal(true)}
            icon={<DIcon icon="fa-upload" cdi={false} classCustom="ml-1" />}
          >
            آپلود فایل
          </Button>
        </div>
      </div>

      {value.length === 0 ? (
        <p className="text-sm text-gray-500">
          فایلی برای این فرم انتخاب نشده است.
        </p>
      ) : (
        <div className="space-y-3">
          {value.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-wrap items-center gap-3 border border-gray-200 dark:border-slate-700 rounded-lg p-3 flex-row-reverse text-right"
            >
              {renderThumbnail(doc)}
              <div className="flex-1 min-w-[200px]">
                <p className="font-medium text-slate-800 dark:text-slate-100">
                  {doc.originalName}
                </p>
                <p className="text-xs text-gray-500">
                  {doc.mimeType || "-"}
                  {doc.size ? ` · ${(doc.size / 1024).toFixed(1)} KB` : ""}
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
                  onClick={() => handleRemove(doc.id)}
                >
                  حذف
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUploadModal && (
        <AttachmentsModal
          title="افزودن سند"
          onClose={() => setShowUploadModal(false)}
        >
          <DocumentCreateForm
            defaultValues={
              taskId
                ? { entityType: "Task", entityId: taskId, taskId }
                : undefined
            }
            onCreated={handleUploadSuccess}
            onError={() => setShowUploadModal(false)}
          />
        </AttachmentsModal>
      )}

      {showSelectModal && (
        <AttachmentsModal
          title="انتخاب سند موجود"
          onClose={() => setShowSelectModal(false)}
        >
          {selectLoading ? (
            <p className="text-sm text-gray-500">در حال بارگذاری...</p>
          ) : availableDocs.length === 0 ? (
            <p className="text-sm text-gray-500">
              سندی برای انتخاب وجود ندارد.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-gray-500">
                  {selectedIds.size
                    ? `${selectedIds.size} سند انتخاب شده`
                    : "هیچ سندی انتخاب نشده است"}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedIds(new Set());
                      setShowSelectModal(false);
                    }}
                  >
                    انصراف
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConfirmSelection}
                    disabled={!selectedIds.size}
                  >
                    افزودن موارد انتخاب‌شده
                  </Button>
                </div>
              </div>
              {availableDocs.map((doc) => {
                const isSelected = selectedIds.has(doc.id);
                return (
                  <div
                    key={doc.id}
                    className="border border-gray-200 dark:border-slate-700 rounded-lg p-3 flex gap-3 items-center flex-row-reverse text-right"
                  >
                    {renderThumbnail(doc, 64)}
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2">
                        {doc.originalName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {doc.mimeType || "-"}
                        {doc.size
                          ? ` · ${(doc.size / 1024).toFixed(1)} KB`
                          : ""}
                        {doc.taskId && taskId !== doc.taskId && (
                          <span className="text-amber-600 font-medium mr-2">
                            متصل به وظیفه دیگر
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant={isSelected ? "primary" : "secondary"}
                        onClick={() => toggleSelectDoc(doc.id)}
                      >
                        {isSelected ? "انتخاب شد" : "انتخاب"}
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
                );
              })}
            </div>
          )}
        </AttachmentsModal>
      )}

      {previewDoc && previewDoc.url && (
        <FileViewer
          url={previewDoc.url}
          mimeType={previewDoc.mimeType || ""}
          fileName={previewDoc.originalName}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}

const AttachmentsModal = ({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[1200] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 p-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition"
          >
            <DIcon icon="fa-xmark" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>,
    document.body
  );
};
