"use client";

import { DetailPageWrapper } from "@/@Client/Components/wrappers";
import { useEffect, useMemo, useState } from "react";
import EditForm from "../../components/EditForm";
import TeamPermissionForm from "../../components/TeamPermissionForm";
import { useDocument } from "../../hooks/useDocument";

export default function DocumentViewPage({ id }: { id: number }) {
  const { getById, remove, loading } = useDocument();
  const [doc, setDoc] = useState<any | null>(null);

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
    </div>
  );
}
