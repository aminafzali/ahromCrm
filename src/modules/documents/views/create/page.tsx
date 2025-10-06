"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DocumentCreateForm from "../../components/DocumentCreateForm";

export default function CreatePage() {
  const router = useRouter();
  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6">ایجاد سند جدید</h1>

      <Link
        href="/dashboard/documents"
        className="flex justify-start items-center mb-6"
      >
        <button className="btn btn-ghost">
          <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
          بازگشت
        </button>
      </Link>

      <DocumentCreateForm
        onCreated={() => router.push("/dashboard/documents")}
      />
    </div>
  );
}
