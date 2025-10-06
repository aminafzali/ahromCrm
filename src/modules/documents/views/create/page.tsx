"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { CreatePageProps } from "@/@Client/types/crud";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import DocumentCreateForm from "../../components/DocumentCreateForm";

export default function CreatePage({
  back = true,
  defaultValues,
  after,
}: CreatePageProps) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6">ایجاد سند جدید</h1>

      {back && (
        <Link
          href="/dashboard/documents"
          className="flex justify-start items-center mb-6"
        >
          <button className="btn btn-ghost">
            <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
            بازگشت به لیست اسناد
          </button>
        </Link>
      )}

      {error && (
        <div className="alert alert-error mb-4">
          <DIcon icon="fa-triangle-exclamation" cdi={false} />
          <span className="ml-2">{error}</span>
        </div>
      )}

      <DocumentCreateForm
        onCreated={() => {
          console.debug("[DOC_CREATE_PAGE] onCreated -> navigating to list");
          if (after) after();
          else router.push("/dashboard/documents");
        }}
        onError={(err) => {
          console.error("[DOC_CREATE_PAGE] create error", err);
          setError(
            typeof err === "string" ? err : err?.message || "خطا در ایجاد سند"
          );
        }}
        defaultValues={defaultValues as any}
      />
    </div>
  );
}
