"use client";

import { useState } from "react";
import { useDocument } from "../hooks/useDocument";

export default function TeamPermissionForm({
  id,
  onChanged,
}: {
  id: number;
  onChanged?: () => void;
}) {
  const { setSubmitting } = useDocument();
  const repo = new (class {
    upsert = async (
      teamId: number,
      canRead: boolean,
      canWrite: boolean,
      canDelete: boolean
    ) => {
      await fetch(`/api/documents/${id}/permissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, canRead, canWrite, canDelete }),
      });
    };
    remove = async (teamId: number) => {
      await fetch(
        `/api/documents/${id}/permissions?teamId=${encodeURIComponent(
          String(teamId)
        )}`,
        {
          method: "DELETE",
        }
      );
    };
  })();

  const [teamId, setTeamId] = useState("");
  const [canRead, setCanRead] = useState(true);
  const [canWrite, setCanWrite] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  return (
    <div className="space-y-2">
      <div className="font-semibold">دسترسی تیم</div>
      <div className="flex gap-2 items-center">
        <input
          className="border p-2"
          placeholder="teamId"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
        />
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={canRead}
            onChange={(e) => setCanRead(e.target.checked)}
          />{" "}
          خواندن
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={canWrite}
            onChange={(e) => setCanWrite(e.target.checked)}
          />{" "}
          نوشتن
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={canDelete}
            onChange={(e) => setCanDelete(e.target.checked)}
          />{" "}
          حذف
        </label>
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded"
          onClick={async () => {
            if (!teamId) return;
            setSubmitting?.(true as any);
            try {
              await repo.upsert(Number(teamId), canRead, canWrite, canDelete);
              onChanged?.();
            } finally {
              setSubmitting?.(false as any);
            }
          }}
        >
          ذخیره
        </button>
        <button
          className="bg-red-600 text-white px-3 py-1 rounded"
          onClick={async () => {
            if (!teamId) return;
            setSubmitting?.(true as any);
            try {
              await repo.remove(Number(teamId));
              onChanged?.();
            } finally {
              setSubmitting?.(false as any);
            }
          }}
        >
          حذف دسترسی
        </button>
      </div>
    </div>
  );
}
