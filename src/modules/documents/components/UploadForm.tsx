"use client";

import React, { useState } from "react";

type Props = {
  onUploaded?: (created: any[]) => void;
};

export default function UploadForm({ onUploaded }: Props) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [type, setType] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [entityType, setEntityType] = useState<string>("");
  const [entityId, setEntityId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) return;
    setLoading(true);
    try {
      const form = new FormData();
      Array.from(files).forEach((f) => form.append("files", f));
      if (type) form.append("type", type);
      if (categoryId) form.append("categoryId", categoryId);
      if (entityType) form.append("entityType", entityType);
      if (entityId) form.append("entityId", entityId);

      const res = await fetch(`/api/documents/upload`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onUploaded?.(data.files || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="file"
        multiple
        onChange={(e) => setFiles(e.target.files)}
        className="block w-full"
      />
      <input
        type="text"
        placeholder="type"
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="border p-2 w-full"
      />
      <input
        type="number"
        placeholder="categoryId"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="border p-2 w-full"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="entityType"
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          type="number"
          placeholder="entityId"
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
          className="border p-2 w-full"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "در حال آپلود..." : "آپلود"}
      </button>
    </form>
  );
}
