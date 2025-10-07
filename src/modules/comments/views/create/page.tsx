"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Select3 from "@/@Client/Components/ui/Select3";
import { useDocument } from "@/modules/documents/hooks/useDocument";
import { useKnowledge } from "@/modules/knowledge/hooks/useKnowledge";
import { useProject } from "@/modules/projects/hooks/useProject";
import { useSupports } from "@/modules/supports/hooks/useSupports";
import { useTask } from "@/modules/tasks/hooks/useTask";
import { Button } from "ndui-ahrom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useComments } from "../../hooks/useComments";

const ENTITY_TYPES = [
  { value: "Task", label: "وظیفه" },
  { value: "Project", label: "پروژه" },
  { value: "Knowledge", label: "دانش" },
  { value: "Document", label: "سند" },
  { value: "Support", label: "پشتیبانی" },
];

export default function CommentsCreatePage() {
  const router = useRouter();
  const { create, submitting, error } = useComments();

  const { getAll: getAllTasks } = useTask();
  const { getAll: getAllProjects } = useProject();
  const { getAll: getAllKnowledge } = useKnowledge();
  const { getAll: getAllDocuments } = useDocument();
  const { getAll: getAllSupports } = useSupports();

  const [entityType, setEntityType] = useState<string>("");
  const [entityId, setEntityId] = useState<number | null>(null);
  const [body, setBody] = useState<string>("");
  const [options, setOptions] = useState<{ value: number; label: string }[]>(
    []
  );

  useEffect(() => {
    async function loadOptions() {
      setOptions([]);
      setEntityId(null);
      if (!entityType) return;
      let res: any;
      if (entityType === "Task") {
        res = await getAllTasks({ page: 1, limit: 100 });
        setOptions(
          (res?.data || []).map((t: any) => ({ value: t.id, label: t.title }))
        );
      } else if (entityType === "Project") {
        res = await getAllProjects({ page: 1, limit: 100 });
        setOptions(
          (res?.data || []).map((p: any) => ({ value: p.id, label: p.name }))
        );
      } else if (entityType === "Knowledge") {
        res = await getAllKnowledge({ page: 1, limit: 100 });
        setOptions(
          (res?.data || []).map((k: any) => ({ value: k.id, label: k.title }))
        );
      } else if (entityType === "Document") {
        res = await getAllDocuments({ page: 1, limit: 100 });
        setOptions(
          (res?.data || []).map((d: any) => ({
            value: d.id,
            label: d.originalName || `سند #${d.id}`,
          }))
        );
      } else if (entityType === "Support") {
        res = await getAllSupports({ page: 1, limit: 100 });
        setOptions(
          (res?.data || []).map((s: any) => ({ value: s.id, label: s.title }))
        );
      }
    }
    loadOptions();
  }, [entityType]);

  const canSubmit = useMemo(
    () => !!entityType && !!entityId && body.trim().length > 0,
    [entityType, entityId, body]
  );

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const result: any = await create({
      entityType,
      entityId: Number(entityId),
      body: body.trim(),
    } as any);
    if (result?.id || result?.data?.id) {
      router.push("/dashboard/comments");
    }
  };

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6">ایجاد کامنت</h1>

      <Link
        href="/dashboard/comments"
        className="flex justify-start items-center mb-6"
      >
        <button className="btn btn-ghost">
          <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
          بازگشت به لیست کامنت‌ها
        </button>
      </Link>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select3
          name="entityType"
          label="نوع موجودیت"
          value={entityType as any}
          options={ENTITY_TYPES}
          onChange={(e: any) => setEntityType(e?.target?.value || e)}
          required
        />

        <Select3
          name="entityId"
          label="انتخاب مورد"
          value={entityId as any}
          options={options}
          onChange={(e: any) => setEntityId(Number(e?.target?.value || e))}
          disabled={!entityType}
          required
        />
        <div className="md:col-span-2">
          <textarea
            name="body"
            className="w-full p-2 border rounded"
            value={body}
            onChange={(e: any) => setBody(e.target.value)}
            placeholder="نظر خود را بنویسید"
            rows={6}
          />
        </div>
      </div>

      <div className="mt-6">
        <Button
          className="btn btn-primary text-white"
          onClick={handleSubmit}
          disabled={submitting || !canSubmit}
        >
          ایجاد کامنت
        </Button>
      </div>
    </div>
  );
}
