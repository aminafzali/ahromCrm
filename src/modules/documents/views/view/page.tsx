"use client";

import { DetailPageWrapper } from "@/@Client/Components/wrappers";
import { useChat } from "@/modules/chat/hooks/useChat";
import CommentsThread from "@/modules/comments/components/Thread";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import EditForm from "../../components/EditForm";
import TeamPermissionForm from "../../components/TeamPermissionForm";
import { useDocument } from "../../hooks/useDocument";

export default function DocumentViewPage({ id }: { id: number }) {
  const { getById, remove, loading } = useDocument();
  const [doc, setDoc] = useState<any | null>(null);
  const { repo: chatRepo } = useChat();
  const router = useRouter();

  const load = async () => {
    const data = await getById(id);
    if (data) setDoc(data);
  };

  useEffect(() => {
    load();
  }, []);

  const display = useMemo(() => {
    if (!doc) return {} as any;
    return {
      نام: doc.originalName,
      نوع: doc.mimeType,
      اندازه: Number(doc.size || 0).toLocaleString(),
      دسته: doc.category?.name || "-",
      موجودیت: doc.entityType ? `${doc.entityType}#${doc.entityId}` : "-",
      دانلود: (
        <a
          className="text-blue-600"
          href={doc.url}
          target="_blank"
          rel="noreferrer"
        >
          دانلود
        </a>
      ),
    } as Record<string, any>;
  }, [doc]);

  return (
    <div className="p-4 space-y-4">
      <DetailPageWrapper
        data={display}
        title="جزئیات سند"
        loading={loading}
        error={undefined}
        onDelete={async () => {
          await remove(id);
        }}
        editUrl={undefined as any}
      />
      <div className="grid md:grid-cols-2 gap-4">
        <EditForm id={id} onSaved={load} />
        <TeamPermissionForm id={id} onChanged={load} />
      </div>
      {doc?.id && (
        <div className="mt-8 space-y-4">
          <CommentsThread entityType="Document" entityId={Number(id)} />
          <button
            className="btn btn-outline"
            onClick={async () => {
              const roomName = `Document#${id}`;
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
            گفتگو برای این سند
          </button>
        </div>
      )}
    </div>
  );
}
