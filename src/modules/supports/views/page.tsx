"use client";

import Loading from "@/@Client/Components/common/Loading";
import IndexWrapper from "@/@Client/Components/wrappers/V2/IndexWrapper";
import { FilterOption } from "@/@Client/types";
import CategoryTree from "@/modules/supports-categories/components/CategoryTree";
import { useSupportCategory } from "@/modules/supports-categories/hooks/useSupportCategory";
import { SupportCategoryWithRelations } from "@/modules/supports-categories/types";
import { useEffect, useMemo, useState } from "react";
import { columnsForAdmin } from "../data/table";
import { SupportsRepository } from "../repo/SupportsRepository";

export default function SupportsIndexPage() {
  const { getAll, loading } = useSupportCategory();
  const [categories, setCategories] = useState<SupportCategoryWithRelations[]>(
    []
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getAll({ page: 1, limit: 1000 });
        setCategories(res?.data || []);
      } catch (e) {}
    };
    fetchCats();
  }, []);

  const extraFilter = useMemo(() => {
    if (!selectedCategoryId) return {} as any;
    return { categoryId: selectedCategoryId } as any;
  }, [selectedCategoryId]);
  const filters: FilterOption[] = [
    {
      name: "type_in",
      label: "نوع پشتیبانی",
      options: [
        { value: "all", label: "همه" },
        { value: "SALES_ORDER", label: "سفارش فروش" },
        { value: "QUOTE", label: "استعلام" },
        { value: "ORDER_FOLLOWUP", label: "پیگیری سفارش" },
        { value: "PURCHASE_ORDER", label: "سفارش خرید" },
        { value: "PURCHASE_QUOTE", label: "استعلام خرید" },
        { value: "COMPLAINT", label: "شکایت" },
        { value: "ISSUE", label: "مشکل" },
        { value: "QUESTION", label: "سوال" },
      ],
    },
    {
      name: "priority_in",
      label: "اولویت",
      options: [
        { value: "all", label: "همه" },
        { value: "LOW", label: "کم" },
        { value: "MEDIUM", label: "متوسط" },
        { value: "HIGH", label: "زیاد" },
        { value: "CRITICAL", label: "بحرانی" },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 bg-white dark:bg-slate-800/50 p-4 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            دسته‌بندی‌های پشتیبانی
          </h2>
          {selectedCategoryId && (
            <button
              onClick={() => setSelectedCategoryId(null)}
              className="text-sm text-teal-600 dark:text-teal-400 hover:underline font-semibold"
            >
              پاک کردن
            </button>
          )}
        </div>
        {loading ? (
          <Loading />
        ) : (
          <CategoryTree
            data={categories as any}
            selectedId={selectedCategoryId}
            onNodeClick={(n) =>
              setSelectedCategoryId((p) => (p === n.id ? null : n.id))
            }
          />
        )}
      </div>

      <div className="lg:col-span-3">
        <IndexWrapper
          columns={columnsForAdmin}
          repo={new SupportsRepository()}
          title="تیکت‌های پشتیبانی"
          defaultViewMode="list"
          filterOptions={filters}
          extraFilter={extraFilter}
        />
      </div>
    </div>
  );
}
