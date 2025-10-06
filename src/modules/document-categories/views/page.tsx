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

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await getAll({ page: 1, limit: 100 });
      if (mounted) {
        setItems(res.data);
        initialLoadedRef.current = true;
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    const res = await getAll({ page: 1, limit: 100 });
    setItems((prev) => {
      const prevIds = prev.map((x) => x.id).join(",");
      const next = res.data || [];
      const nextIds = next.map((x: any) => x.id).join(",");
      return prevIds === nextIds && prev.length === next.length ? prev : next;
    });
  }, []);

  const fetcher = useCallback(async (params: any) => {
    const res = await getAll(params);
    const next = res.data || [];
    setItems((prev) => {
      const prevIds = prev.map((x) => x.id).join(",");
      const nextIds = next.map((x: any) => x.id).join(",");
      return prevIds === nextIds && prev.length === next.length ? prev : next;
    });
    return res;
  }, []);

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
          <div className="lg:col-span-1 bg-white dark:bg-slate-800/50 p-4 rounded-xl shadow-sm">
            <TreeList items={items} />
          </div>
          <div className="lg:col-span-2">
            <DataTableWrapper3
              columns={columnsForAdmin}
              loading={loading || !initialLoadedRef.current}
              title="لیست دسته‌ها"
              createUrl="/dashboard/document-categories/create"
              fetcher={fetcher}
              defaultViewMode="list"
              filterOptions={filterOptions}
              dateFilterFields={dateFilterFields}
              listItemRender={listItemRender}
            />
          </div>
        </div>
      )}
    </div>
  );
}
