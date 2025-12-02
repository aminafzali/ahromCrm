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
      name: "taskId",
      label: "وظیفه",
      type: "number",
    },
    {
      name: "knowledgeId",
      label: "دانش",
      type: "number",
    },
    {
      name: "documentId",
      label: "سند",
      type: "number",
    },
    {
      name: "projectId",
      label: "پروژه",
      type: "number",
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
