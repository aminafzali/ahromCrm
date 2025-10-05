"use client";

import React, { useState } from "react";
import { useDocumentCategory } from "../hooks/useDocumentCategory";

export default function CreateForm({ onCreated }: { onCreated?: () => void }) {
  const { create, submitting } = useDocumentCategory();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create({
      name,
      description,
      parent: parentId ? { id: Number(parentId) } : undefined,
    } as any);
    setName("");
    setDescription("");
    setParentId("");
    onCreated?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-2 md:grid-cols-4 items-end"
    >
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
      <button
        disabled={submitting}
        className="bg-green-600 text-white px-3 py-2 rounded"
      >
        ایجاد
      </button>
    </form>
  );
}
