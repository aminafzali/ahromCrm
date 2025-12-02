// مسیر فایل: src/modules/cheques/views/page.tsx

"use client";

import DataTableWrapper from "@/@Client/Components/wrappers/DataTableWrapper2";
import { FilterOption } from "@/@Client/types";
import { useMemo } from "react";
import { columnsForAdmin, listItemRender } from "../data/table";
import { useCheque } from "../hooks/useCheque";
import { ChequeWithRelations } from "../types";

export default function IndexPage({ isAdmin = true, title = "چک‌ها" }) {
  const { getAll, loading, error } = useCheque();

  // فیلترهای ثابت (select box)
  const filters: FilterOption[] = useMemo(
    () => [
      {
        name: "status_in",
        label: "وضعیت",
        options: [
          { value: "all", label: "همه" },
          { value: "CREATED", label: "ایجاد شده" },
          { value: "HANDED_OVER", label: "تحویل داده/گرفته شده" },
          { value: "DEPOSITED", label: "خوابانده شده" },
          { value: "CLEARED", label: "پاس شده" },
          { value: "RETURNED", label: "برگشتی" },
          { value: "CANCELLED", label: "باطل شده" },
          { value: "LOST", label: "مفقود شده" },
        ],
      },
      {
        name: "direction_in",
        label: "جهت",
        options: [
          { value: "all", label: "همه" },
          { value: "INCOMING", label: "دریافتی" },
          { value: "OUTGOING", label: "پرداختی" },
        ],
      },
    ],
    []
  );

  // فیلدهای تاریخ
  const dateFilters = useMemo(
    () => [
      { name: "dueDate", label: "تاریخ سررسید" },
      { name: "issueDate", label: "تاریخ صدور" },
      { name: "createdAt", label: "تاریخ ایجاد" },
    ],
    []
  );

  // محتوای تب‌ها
  const incomingContent = useMemo(
    () => (
      <DataTableWrapper<ChequeWithRelations>
        columns={columnsForAdmin}
        createUrl="/dashboard/cheques/create"
        loading={loading}
        error={error}
        title={"چک‌های دریافتی"}
        fetcher={getAll}
        extraFilter={{ direction: "INCOMING" }}
        filterOptions={filters}
        dateFilterFields={dateFilters}
        listItemRender={listItemRender}
        defaultViewMode="list"
      />
    ),
    [loading, error, getAll, filters, dateFilters]
  );

  const outgoingContent = useMemo(
    () => (
      <DataTableWrapper<ChequeWithRelations>
        columns={columnsForAdmin}
        createUrl="/dashboard/cheques/create"
        loading={loading}
        error={error}
        title={"چک‌های پرداختی"}
        fetcher={getAll}
        extraFilter={{ direction: "OUTGOING" }}
        filterOptions={filters}
        dateFilterFields={dateFilters}
        listItemRender={listItemRender}
        defaultViewMode="list"
      />
    ),
    [loading, error, getAll, filters, dateFilters]
  );

  const allContent = useMemo(
    () => (
      <DataTableWrapper<ChequeWithRelations>
        columns={columnsForAdmin}
        createUrl="/dashboard/cheques/create"
        loading={loading}
        error={error}
        title={"همه چک‌ها"}
        fetcher={getAll}
        filterOptions={filters}
        dateFilterFields={dateFilters}
        listItemRender={listItemRender}
        defaultViewMode="list"
      />
    ),
    [loading, error, getAll, filters, dateFilters]
  );

  const tabs = useMemo(
    () => [
      { id: "incoming", label: "دریافتی‌ها", content: incomingContent },
      { id: "outgoing", label: "پرداختی‌ها", content: outgoingContent },
      { id: "all", label: "همه", content: allContent },
    ],
    [incomingContent, outgoingContent, allContent]
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      <div className="tabs tabs-boxed mb-4">
        {tabs.map((tab) => (
          <a
            key={tab.id}
            className="tab"
            onClick={() => {
              // اینجا می‌توانی منطق تغییر تب را پیاده کنی
            }}
          >
            {tab.label}
          </a>
        ))}
      </div>
      {tabs[0].content}
    </div>
  );
}
