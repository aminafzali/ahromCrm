// مسیر فایل: src/modules/documents/views/page.tsx
"use client";

import DataTableWrapper3 from "@/@Client/Components/wrappers/DataTableWrapper3";
import TreeList from "@/modules/document-categories/components/TreeList";
import { useDocumentCategory } from "@/modules/document-categories/hooks/useDocumentCategory";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
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
        const list = cats?.data || [];
        setCategories(list);
        setCategoryOptions(
          list.map((c: any) => ({ label: c.name, value: c.id }))
        );
      } catch {}
    })();
  }, []);

  // فقط entityType به صورت هاردکد شده به درخواست کاربر
  const filterOptions = useMemo(
    () => [
      {
        name: "entityType",
        label: "نوع موجودیت",
        options: [
          { value: "all", label: "همه" },
          { value: "Request", label: "درخواست" },
          { value: "Invoice", label: "فاکتور" },
          { value: "Task", label: "تسک" },
          { value: "Project", label: "پروژه" },
          { value: "Other", label: "سایر" },
        ],
      },
    ],
    []
  );

  const dateFilterFields = useMemo(
    () => [
      { name: "createdAt", label: "تاریخ ایجاد" },
      { name: "updatedAt", label: "تاریخ به‌روزرسانی" },
    ],
    []
  );

  const fetcher = async (params: any) => {
    // نگاشت فیلتر entityType به پارامتر صحیح API
    const mapped = { ...params };
    if (mapped.filters?.entityType === "all") {
      delete mapped.filters.entityType;
    }
    const res = await getAll(mapped);
    setItems(res.data || []);
    return res;
  };

  const getDescendantIds = useCallback((categoryId: number, all: any[]) => {
    const allIds: number[] = [categoryId];
    const queue: number[] = [categoryId];
    while (queue.length) {
      const current = queue.shift()!;
      const children = all.filter((c) => c.parentId === current);
      for (const ch of children) {
        allIds.push(ch.id);
        queue.push(ch.id);
      }
    }
    return allIds;
  }, []);

  const extraFilter = useMemo(() => {
    if (!selectedCategory) return undefined;
    const ids = getDescendantIds(selectedCategory, categories);
    return { categoryId_in: ids.join(",") } as any;
  }, [selectedCategory, categories, getDescendantIds]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">مدیریت اسناد</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-slate-800/50 p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">دسته‌بندی‌ها</h2>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-sm text-teal-600 hover:underline font-semibold"
              >
                پاک کردن
              </button>
            )}
          </div>
          <TreeList
            items={categories as any}
            selectedId={selectedCategory}
            onNodeClick={(n: any) =>
              setSelectedCategory((prev) => (prev === n.id ? null : n.id))
            }
          />
        </div>
        <div className="lg:col-span-3">
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
            extraFilter={extraFilter}
            listClassName="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
          />
        </div>
      </div>
    </div>
  );
}
