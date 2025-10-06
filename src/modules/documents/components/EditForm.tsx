"use client";

import React, { useEffect, useState } from "react";
import { useDocument } from "../hooks/useDocument";

export default function EditForm({
  id,
  onSaved,
}: {
  id: number;
  onSaved?: () => void;
}) {
  const { getById, update, submitting } = useDocument();
  const [type, setType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [entityType, setEntityType] = useState("");
  const [entityId, setEntityId] = useState("");

  useEffect(() => {
    (async () => {
      const d = await getById(id);
      if (!d) return;
      setType(d.type ?? "");
      setCategoryId(d.categoryId ? String(d.categoryId) : "");
      setEntityType(d.entityType ?? "");
      setEntityId(d.entityId ? String(d.entityId) : "");
    })();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await update(id, {
      type: type || undefined,
      category: categoryId ? { id: Number(categoryId) } : undefined,
      entityType: entityType || undefined,
      entityId: entityId ? Number(entityId) : undefined,
    } as any);
    onSaved?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="font-semibold">ویرایش سند</div>
      <div className="grid md:grid-cols-4 gap-2 items-end">
        <input
          className="border p-2"
          placeholder="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="categoryId"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="entityType"
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="entityId"
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
        />
      </div>
      <button
        disabled={submitting}
        className="bg-amber-600 text-white px-3 py-2 rounded"
      >
        ذخیره تغییرات
      </button>
    </form>
  );
}
