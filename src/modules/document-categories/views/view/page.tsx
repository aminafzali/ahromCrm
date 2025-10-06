"use client";

import { DetailPageWrapper } from "@/@Client/Components/wrappers";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useDocumentCategory } from "../../hooks/useDocumentCategory";

export default function DocumentCategoryViewPage({ id }: { id: number }) {
  const router = useRouter();
  const { getById, remove, loading, statusCode, error } = useDocumentCategory();
  const [category, setCategory] = useState<any | null>(null);

  const load = async () => {
    const data = await getById(id);
    if (data) setCategory(data);
  };

  useEffect(() => {
    load();
  }, []);

  const display = useMemo(() => {
    if (!category) return {} as any;
    return {
      نام: category.name,
      توضیح: category.description || "-",
      والد: category.parent?.name || "-",
      "تعداد زیرشاخه": category.children?.length || 0,
    } as Record<string, any>;
  }, [category]);

  return (
    <div className="p-4 space-y-4">
      <DetailPageWrapper
        data={display}
        title="جزئیات دسته سند"
        loading={loading}
        error={error}
        onDelete={async () => {
          await remove(id);
          router.push("/dashboard/document-categories");
        }}
        editUrl={`/dashboard/document-categories/${id}/update`}
      />
    </div>
  );
}
