"use client";

import DIcon from "@/@Client/Components/common/DIcon";
// import { useChat } from "@/modules/chat/hooks/useChat"; // Removed: Chat module deprecated
import CommentsThread from "@/modules/comments/components/Thread";
// Documents temporarily disabled per request
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import KnowledgeACLForm from "../../components/KnowledgeACLForm";
import { useKnowledge } from "../../hooks/useKnowledge";

export default function KnowledgeViewPage({ id }: { id: number }) {
  const { getById, remove, loading, error } = useKnowledge();
  const [item, setItem] = useState<any | null>(null);
  // documents disabled
  // const { repo: chatRepo } = useChat(); // Removed: Chat module deprecated
  const router = useRouter();

  // documents disabled

  const load = async () => {
    const data = await getById(id);
    if (data) setItem(data);
  };

  useEffect(() => {
    load();
    // documents disabled
  }, []);

  // documents disabled

  // documents disabled

  // documents disabled

  const display = useMemo(() => {
    if (!item) return {} as any;
    return {
      عنوان: item.title,
      اسلاگ: item.slug,
      وضعیت: item.status,
      دسته: item.category?.name || "-",
      خلاصه: item.excerpt || "-",
    } as Record<string, any>;
  }, [item]);

  return (
    <div className="p-4">
      {/* Big Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-5 md:p-7">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex items-center gap-2">
              <DIcon
                icon="fa-book-open"
                cdi={false}
                classCustom="text-teal-600"
              />
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                {item?.title || "دانش"}
              </h1>
            </div>
            <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <DIcon icon="fa-calendar" cdi={false} />
              <span>
                {item?.createdAt
                  ? new Date(item.createdAt).toLocaleDateString("fa-IR")
                  : "—"}
              </span>
            </div>
          </div>

          {/* Meta */}
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-300">
            <span>دسته: </span>
            <span className="font-medium">
              {item?.category?.name || "بدون دسته"}
            </span>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-200 dark:border-slate-700" />

        {/* Content */}
        {item?.content && (
          <div className="p-5 md:p-7">
            <div
              className="prose prose-sm md:prose lg:prose-lg max-w-none rtl text-justify leading-8"
              dir="rtl"
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          </div>
        )}

        {/* Footer Call to actions */}
        <div className="p-4 md:p-6 flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 md:justify-between bg-slate-50 dark:bg-slate-900/40">
          <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
            آخرین بروزرسانی:{" "}
            {item?.updatedAt
              ? new Date(item.updatedAt).toLocaleDateString("fa-IR")
              : "—"}
          </div>
          <div className="flex gap-2">
            <Link
              href={`/dashboard/knowledge/${id}/update`}
              className="btn btn-outline"
            >
              <DIcon icon="fa-edit" cdi={false} classCustom="ml-2" />
              ویرایش
            </Link>
            <button
              className="btn btn-error btn-outline"
              onClick={async () => {
                await remove(id);
              }}
            >
              <DIcon icon="fa-trash" cdi={false} classCustom="ml-2" />
              حذف
            </button>
          </div>
        </div>
      </div>
      {item?.id && (
        <div className="mt-8">
          <CommentsThread entityType="Knowledge" entityId={Number(item.id)} />
        </div>
      )}
      {/* attachments disabled */}

      {/* documents modals disabled */}
      {/* TODO: Add internal-chat link for this knowledge */}
      <div className="mt-8">
        <KnowledgeACLForm id={id} initial={item} />
      </div>
    </div>
  );
}
