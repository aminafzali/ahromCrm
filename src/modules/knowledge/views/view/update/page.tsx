"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import KnowledgeForm from "../../../components/KnowledgeForm";
import { useKnowledge } from "../../../hooks/useKnowledge";

export default function KnowledgeUpdatePage({ id }: { id: number }) {
  const router = useRouter();
  const { getById, update, submitting } = useKnowledge();
  const [initial, setInitial] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      const d = await getById(id);
      if (d) setInitial(d);
    })();
  }, [id, getById]);

  const handleSubmit = async (data: any) => {
    await update(id, data);
    router.push(`/dashboard/knowledge/${id}`);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">ویرایش دانش</h1>
        <Link href={`/dashboard/knowledge/${id}`} className="btn btn-ghost">
          <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" /> بازگشت
        </Link>
      </div>
      {initial && (
        <KnowledgeForm
          onSubmit={handleSubmit}
          loading={submitting}
          initialData={initial}
        />
      )}
    </div>
  );
}
