"use client";

import IndexWrapper from "@/@Client/Components/wrappers/V2/IndexWrapper";
import { FilterOption } from "@/@Client/types";
import { columnsForAdmin, listItemRender } from "../data/table";
import { useComments } from "../hooks/useComments";
import { CommentsRepository } from "../repo/CommentsRepository";

export default function CommentsIndexPage() {
  const { getAll } = useComments();

  const filters: FilterOption[] = [
    {
      name: "entityType",
      label: "نوع موجودیت",
      options: [
        { value: "all", label: "همه" },
        { value: "Task", label: "وظیفه" },
        { value: "Project", label: "پروژه" },
        { value: "Knowledge", label: "دانش" },
        { value: "Document", label: "سند" },
        { value: "Support", label: "پشتیبانی" },
      ],
    },
  ];

  const dateFilters = [{ name: "createdAt", label: "تاریخ ایجاد" }];

  return (
    <IndexWrapper
      columns={columnsForAdmin}
      repo={new CommentsRepository()}
      title="کامنت‌ها"
      listItemRender={listItemRender}
      filterOptions={filters}
      dateFilterFields={dateFilters}
      defaultViewMode="list"
    />
  );
}
