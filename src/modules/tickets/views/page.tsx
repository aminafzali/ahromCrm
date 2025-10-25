"use client";

import IndexWrapper from "@/@Client/Components/wrappers/V2/IndexWrapper";
import { FilterOption } from "@/@Client/types";
import { useMemo, useState } from "react";
import { columnsForAdmin } from "../data/table";
import { TicketsRepository } from "../repo/TicketsRepository";

export default function TicketsIndexPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );

  const extraFilter = useMemo(() => {
    if (!selectedCategoryId) return {} as any;
    return { categoryId: selectedCategoryId } as any;
  }, [selectedCategoryId]);

  const filters: FilterOption[] = [
    {
      name: "status_in",
      label: "وضعیت",
      options: [
        { value: "all", label: "همه" },
        { value: "OPEN", label: "باز" },
        { value: "IN_PROGRESS", label: "در حال پیگیری" },
        { value: "PENDING", label: "در انتظار" },
        { value: "RESOLVED", label: "حل شده" },
        { value: "CLOSED", label: "بسته" },
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
        { value: "URGENT", label: "فوری" },
      ],
    },
    {
      name: "assignedToId",
      label: "تخصیص یافته به",
      options: [
        { value: "all", label: "همه" },
        { value: "unassigned", label: "تخصیص نیافته" },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 bg-white dark:bg-slate-800/50 p-4 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            فیلترهای تیکت
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
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>فیلترهای اضافی برای تیکت‌ها</p>
          <p className="mt-2">• وضعیت تیکت</p>
          <p>• اولویت</p>
          <p>• تخصیص یافته</p>
        </div>
      </div>

      <div className="lg:col-span-3">
        <IndexWrapper
          columns={columnsForAdmin}
          repo={new TicketsRepository()}
          title="تیکت‌های پشتیبانی"
          defaultViewMode="list"
          filterOptions={filters}
          extraFilter={extraFilter}
        />
      </div>
    </div>
  );
}
