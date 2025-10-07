"use client";

import DataTableWrapper3 from "@/@Client/Components/wrappers/DataTableWrapper3";
import { useMemo } from "react";
import { columnsForAdmin, listItemRender } from "../data/table";
import { useKnowledge } from "../hooks/useKnowledge";

export default function KnowledgeListPage() {
  const { getAll, loading, error } = useKnowledge();

  const filterOptions = useMemo(
    () => [
      {
        name: "status",
        label: "وضعیت",
        options: [
          { value: "all", label: "همه" },
          { value: "DRAFT", label: "پیش‌نویس" },
          { value: "PUBLISHED", label: "انتشار" },
          { value: "ARCHIVED", label: "آرشیو" },
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

  const fetcher = async (params: any) => getAll(params);

  return (
    <div className="p-4">
      <DataTableWrapper3
        columns={columnsForAdmin}
        title="دانش‌نامه"
        createUrl="/dashboard/knowledge/create"
        fetcher={fetcher}
        loading={loading}
        error={error}
        defaultViewMode="list"
        filterOptions={filterOptions}
        dateFilterFields={dateFilterFields}
        listItemRender={listItemRender}
      />
    </div>
  );
}
