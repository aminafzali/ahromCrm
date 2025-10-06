"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Link from "next/link";
import CategoryCreateForm from "../../components/CategoryCreateForm";

export default function CreatePage() {
  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6">ایجاد دسته سند</h1>

      <Link
        href="/dashboard/document-categories"
        className="flex justify-start items-center mb-6"
      >
        <button className="btn btn-ghost">
          <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
          بازگشت
        </button>
      </Link>

      <CategoryCreateForm onCreated={() => {}} />
    </div>
  );
}
