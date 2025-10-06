"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EditForm from "../../../components/EditForm";

export default function UpdatePage({ id }: { id: number }) {
  const router = useRouter();
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">ویرایش سند</h1>
        <Link href={`/dashboard/documents/${id}`} className="btn btn-ghost">
          <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" /> بازگشت
        </Link>
      </div>
      <EditForm
        id={id}
        onSaved={() => router.push(`/dashboard/documents/${id}`)}
      />
    </div>
  );
}
