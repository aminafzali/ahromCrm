"use client";

import IndexWrapper from "@/@Client/Components/wrappers/V2/IndexWrapper";
import { FilterOption } from "@/@Client/types";
import { columnsForAdmin } from "../data/table";
import { SupportsRepository } from "../repo/SupportsRepository";

export default function SupportsIndexPage() {
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
    <IndexWrapper
      columns={columnsForAdmin}
      repo={new SupportsRepository()}
      title="تیکت‌های پشتیبانی"
      defaultViewMode="list"
      filterOptions={filters}
    />
  );
}
