"use client";

import DataTableWrapper from "@/@Client/Components/wrappers/DataTableWrapper2";
import { FilterOption } from "@/@Client/types";
import { useMemo } from "react";
import { columnsForAdmin, listItemRender } from "../data/table";
import { useSupportChat } from "../hooks/useSupportChat";
import { SupportTicketWithRelations } from "../types";

export default function TicketTableTab() {
  const { repo } = useSupportChat();

  const filters: FilterOption[] = useMemo(
    () => [
      {
        id: "status",
        name: "status",
        label: "وضعیت",
        options: [
          { value: "OPEN", label: "باز" },
          { value: "PENDING", label: "در انتظار" },
          { value: "IN_PROGRESS", label: "در حال بررسی" },
          { value: "WAITING_CUSTOMER", label: "منتظر پاسخ مشتری" },
          { value: "RESOLVED", label: "حل شده" },
          { value: "CLOSED", label: "بسته شده" },
        ],
      },
      {
        id: "priority",
        name: "priority",
        label: "اولویت",
        options: [
          { value: "LOW", label: "کم" },
          { value: "MEDIUM", label: "متوسط" },
          { value: "HIGH", label: "زیاد" },
          { value: "CRITICAL", label: "بحرانی" },
        ],
      },
    ],
    []
  );

  const dateFilters = useMemo(
    () => [
      { id: "createdAt", name: "createdAt", label: "تاریخ ایجاد" },
      { id: "updatedAt", name: "updatedAt", label: "آخرین به‌روزرسانی" },
    ],
    []
  );

  return (
    <div className="p-6">
      <DataTableWrapper<SupportTicketWithRelations>
        columns={columnsForAdmin}
        createUrl="/dashboard/support-chat/create"
        loading={false}
        error={null}
        title="مدیریت تیکت‌های پشتیبانی"
        fetcher={(params) => repo.getAllTickets(params)}
        filterOptions={filters}
        dateFilterFields={dateFilters}
        listItemRender={listItemRender}
        defaultViewMode="table"
      />
    </div>
  );
}
