"use client";

import { useEffect, useState } from "react";
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
  }, [id]);

  if (loading || !doc) return <div className="p-4">در حال بارگذاری...</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">جزئیات سند</h1>
        <button
          className="text-red-600"
          onClick={async () => {
            await remove(id);
          }}
        >
          حذف
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div>
            <span className="font-semibold">نام:</span> {doc.originalName}
          </div>
          <div>
            <span className="font-semibold">نوع:</span> {doc.mimeType}
          </div>
          <div>
            <span className="font-semibold">اندازه:</span> {doc.size}
          </div>
          {doc.category && (
            <div>
              <span className="font-semibold">دسته:</span> {doc.category?.name}
            </div>
          )}
          {doc.entityType && (
            <div>
              <span className="font-semibold">موجودیت:</span> {doc.entityType}#
              {doc.entityId}
            </div>
          )}
          <div>
            <a
              className="text-blue-600"
              href={doc.url}
              target="_blank"
              rel="noreferrer"
            >
              دانلود
            </a>
          </div>
        </div>
        <div>
          <EditForm id={id} onSaved={load} />
          <TeamPermissionForm id={id} onChanged={load} />
        </div>
      </div>
    </div>
  );
}
