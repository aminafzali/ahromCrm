// مسیر فایل: src/modules/document-categories/views/page.tsx
"use client";

import DataTableWrapper3 from "@/@Client/Components/wrappers/DataTableWrapper3";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import TreeList from "../components/TreeList";
import { columnsForAdmin, listItemRender } from "../data/table";
import { useDocumentCategory } from "../hooks/useDocumentCategory";
import { DocumentCategoryWithRelations } from "../types";

export default function DocumentCategoriesPage() {
  const { getAll, loading } = useDocumentCategory();
  const [items, setItems] = useState<DocumentCategoryWithRelations[]>([]);
  const initialLoadedRef = useRef(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await getAll({ page: 1, limit: 100 });
        if (!mounted) return;
        const next = res.data || [];
        setItems((prev) => {
          const prevIds = prev.map((x) => x.id).join(",");
          const nextIds = next.map((x: any) => x.id).join(",");
          return prevIds === nextIds && prev.length === next.length
            ? prev
            : next;
        });
        if (!initialLoadedRef.current) initialLoadedRef.current = true;
      } catch (e) {}
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    const res = await getAll({ page: 1, limit: 100 });
    const next = res.data || [];
    setItems((prev) => {
      const prevIds = prev.map((x) => x.id).join(",");
      const nextIds = next.map((x: any) => x.id).join(",");
      return prevIds === nextIds && prev.length === next.length ? prev : next;
    });
  }, [getAll]);

  const fetcher = useCallback(
    async (params: any) => {
      // فقط داده را برگردان؛ setState اینجا انجام نده تا از لوپ جلوگیری شود
      return getAll(params);
    },
    [getAll]
  );

  const getDescendantIds = useCallback(
    (categoryId: number, all: DocumentCategoryWithRelations[]) => {
      const allIds: number[] = [categoryId];
      const queue: number[] = [categoryId];
      while (queue.length > 0) {
        const current = queue.shift()!;
        const children = all.filter((c) => c.parentId === current);
        for (const ch of children) {
          allIds.push(ch.id);
          queue.push(ch.id);
        }
      }
      return allIds;
    },
    []
  );

  const extraFilter = useMemo(() => {
    if (!selectedCategory) return undefined;
    const ids = getDescendantIds(selectedCategory, items);
    return { id_in: ids.join(",") } as any;
  }, [selectedCategory, items, getDescendantIds]);

  const filterOptions = useMemo(
    () => [
      {
        name: "parentId",
        label: "فیلتر والد",
        options: [{ value: "all", label: "همه" }],
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

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">دسته‌های اسناد</h1>
      {loading ? (
        <div>در حال بارگذاری...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white dark:bg-slate-800/50 p-4 rounded-xl shadow-sm max-h-[60vh] overflow-y-auto">
            <TreeList
              items={(items || []).filter((x: any) => !x.parentId) as any}
              selectedId={selectedCategory}
              onNodeClick={(n: any) =>
                setSelectedCategory((prev) => (prev === n.id ? null : n.id))
              }
            />
          </div>
          <div className="lg:col-span-2">
            <DataTableWrapper3
              columns={columnsForAdmin}
              loading={!initialLoadedRef.current}
              title="لیست دسته‌ها"
              createUrl="/dashboard/document-categories/create"
              fetcher={fetcher}
              defaultViewMode="list"
              filterOptions={filterOptions}
              dateFilterFields={dateFilterFields}
              listItemRender={listItemRender}
              extraFilter={extraFilter}
            />
          </div>
        </div>
      )}
    </div>
  );
}
