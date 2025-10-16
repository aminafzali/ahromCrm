"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import KnowledgeForm from "../../components/KnowledgeForm";
import { useKnowledge } from "../../hooks/useKnowledge";

export default function KnowledgeCreatePage() {
  const router = useRouter();
  const { create, submitting, error } = useKnowledge();

  const handleSubmit = async (data: any) => {
    const res: any = await create(data);
    if (res?.data?.id) router.push(`/dashboard/knowledge/${res.data.id}`);
    else router.push(`/dashboard/knowledge`);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">ایجاد دانش</h1>
        <Link href="/dashboard/knowledge" className="btn btn-ghost">
          <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" /> بازگشت
        </Link>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <KnowledgeForm onSubmit={handleSubmit} loading={submitting} />
    </div>
  );
}
