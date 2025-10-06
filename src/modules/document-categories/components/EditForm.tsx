"use client";

import React, { useEffect, useState } from "react";
import { useDocumentCategory } from "../hooks/useDocumentCategory";

export default function EditForm({
  id,
  onSaved,
}: {
  id: number;
  onSaved?: () => void;
}) {
  const { getById, update, submitting } = useDocumentCategory();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");

  useEffect(() => {
    (async () => {
      const c = await getById(id);
      if (!c) return;
      setName(c.name ?? "");
      setDescription(c.description ?? "");
      setParentId(c.parentId ? String(c.parentId) : "");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await update(id, {
      name: name || undefined,
      description: description || undefined,
      parent: parentId ? { id: Number(parentId) } : undefined,
    } as any);
    onSaved?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="font-semibold">ویرایش دسته</div>
      <div className="grid md:grid-cols-3 gap-2 items-end">
        <input
          className="border p-2"
          placeholder="نام"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="توضیح"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="parentId"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
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
