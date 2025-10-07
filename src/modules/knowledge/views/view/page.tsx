"use client";

import { DetailPageWrapper } from "@/@Client/Components/wrappers";
import { useChat } from "@/modules/chat/hooks/useChat";
import CommentsThread from "@/modules/comments/components/Thread";
import DocumentCreateForm from "@/modules/documents/components/DocumentCreateForm";
import { listItemRender as docCard } from "@/modules/documents/data/table";
import { useDocument } from "@/modules/documents/hooks/useDocument";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import KnowledgeACLForm from "../../components/KnowledgeACLForm";
import { useKnowledge } from "../../hooks/useKnowledge";

export default function KnowledgeViewPage({ id }: { id: number }) {
  const { getById, remove, loading, error } = useKnowledge();
  const [item, setItem] = useState<any | null>(null);
  const { getAll: getAllDocs } = useDocument();
  const [attachments, setAttachments] = useState<any[]>([]);
  const { repo: chatRepo } = useChat();
  const router = useRouter();

  const load = async () => {
    const data = await getById(id);
    if (data) setItem(data);
  };

  useEffect(() => {
    load();
    getAllDocs({
      page: 1,
      limit: 100,
      filters: { entityType: "Knowledge", entityId: id },
    }).then((res) => {
      setAttachments(res?.data || []);
    });
  }, []);

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
      <DetailPageWrapper
        data={display}
        title="جزئیات دانش"
        loading={loading}
        error={error}
        onDelete={async () => {
          await remove(id);
        }}
        editUrl={`/dashboard/knowledge/${id}/update`}
      />
      {/* محتوا */}
      {item?.content && (
        <div
          className="prose max-w-none mt-6"
          dangerouslySetInnerHTML={{ __html: item.content }}
        />
      )}
      {item?.id && (
        <div className="mt-8">
          <CommentsThread entityType="Knowledge" entityId={Number(item.id)} />
        </div>
      )}
      <div className="mt-10 space-y-4">
        <h2 className="text-lg font-bold">پیوست‌ها</h2>
        <DocumentCreateForm
          defaultValues={{ entityType: "Knowledge", entityId: id }}
          onCreated={() =>
            getAllDocs({
              page: 1,
              limit: 100,
              filters: { entityType: "Knowledge", entityId: id },
            }).then((res) => setAttachments(res?.data || []))
          }
        />
        {attachments?.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {attachments.map((a) => (
              <div key={a.id}>{docCard(a)}</div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-8">
        <button
          className="btn btn-outline"
          onClick={async () => {
            const roomName = `Knowledge#${id}`;
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
          گفتگو برای این دانش
        </button>
      </div>
      <div className="mt-8">
        <KnowledgeACLForm id={id} initial={item} />
      </div>
    </div>
  );
}
