"use client";

import DataTableWrapper3 from "@/@Client/Components/wrappers/DataTableWrapper3";
import { useDocumentCategory } from "@/modules/document-categories/hooks/useDocumentCategory";
import { useEffect, useMemo, useState } from "react";
import { columnsForAdmin, listItemRender } from "../data/table";
import { useDocument } from "../hooks/useDocument";
import { DocumentWithRelations } from "../types";

export default function DocumentsPage() {
  const { getAll, loading, remove } = useDocument();
  const [items, setItems] = useState<DocumentWithRelations[]>([]);
  const { getAll: getAllCategories } = useDocumentCategory();
  const [categoryOptions, setCategoryOptions] = useState<
    { label: string; value: number }[]
  >([]);
  // محلی برای نگه داشتن داده‌ها؛ فیلترها از طریق DataTableWrapper3 اعمال می‌شوند

  useEffect(() => {
    (async () => {
      const res = await getAll({ page: 1, limit: 20 });
      setItems(res.data);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const cats = await getAllCategories({ page: 1, limit: 1000 });
        setCategoryOptions(
          (cats?.data || []).map((c: any) => ({ label: c.name, value: c.id }))
        );
      } catch {}
    })();
  }, []);

  // تنظیمات فیلتر مشابه صفحهٔ وظایف
  const filterOptions = useMemo(
    () => [
      {
        name: "type",
        label: "نوع فایل",
        options: [
          { value: "all", label: "همه" },
          { value: "image", label: "تصویر" },
          { value: "pdf", label: "PDF" },
          { value: "doc", label: "سند" },
          { value: "other", label: "سایر" },
        ],
      },
      {
        name: "categoryId_in",
        label: "دسته",
        options: [{ value: "all", label: "همه" }, ...categoryOptions],
      },
    ],
    [categoryOptions]
  );

  const dateFilterFields = useMemo(
    () => [
      { name: "createdAt", label: "تاریخ ایجاد" },
      { name: "updatedAt", label: "تاریخ به‌روزرسانی" },
    ],
    []
  );

  const fetcher = async (params: any) => {
    const res = await getAll(params);
    setItems(res.data || []);
    return res;
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">مدیریت اسناد</h1>
      <DataTableWrapper3
        columns={columnsForAdmin}
        loading={loading}
        title="لیست اسناد"
        createUrl="/dashboard/documents/create"
        fetcher={fetcher}
        defaultViewMode="list"
        filterOptions={filterOptions}
        dateFilterFields={dateFilterFields}
        listItemRender={listItemRender}
      />
    </div>
  );
}
