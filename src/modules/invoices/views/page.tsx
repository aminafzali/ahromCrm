// مسیر فایل: src/modules/invoices/views/page.tsx

"use client";

import IndexWrapper from "@/@Client/Components/wrappers/V2/IndexWrapper";
import { FilterOption } from "@/@Client/types";
import { useMemo } from "react";
import { columnsForAdmin, columnsForUser } from "../data/table";
import { InvoiceRepository } from "../repo/InvoiceRepository";

export default function IndexPage({ isAdmin = false, title = "صورتحساب‌" }) {
  const filters: FilterOption[] = useMemo(
    () => [
      {
        name: "status_in", // <--- اصلاحیه: اضافه کردن _in
        label: "وضعیت فاکتور",
        options: [
          { value: "all", label: "همه وضعیت‌ها" },
          { value: "PENDING", label: "در انتظار پرداخت" },
          { value: "PAID", label: "پرداخت شده" },
          { value: "CANCELED", label: "لغو شده" },
        ],
      },
      {
        name: "type_in", // <--- اصلاحیه: اضافه کردن _in
        label: "نوع فاکتور",
        options: [
          { value: "all", label: "همه انواع" },
          { value: "SALES", label: "فروش" },
          { value: "PURCHASE", label: "خرید" },
          { value: "PROFORMA", label: "پیش‌فاکتور" },
          { value: "RETURN_SALES", label: "برگشت از فروش" },
          { value: "RETURN_PURCHASE", label: "برگشت از خرید" },
        ],
      },
    ],
    []
  );

  const dateFilters = useMemo(
    () => [
      { name: "createdAt", label: "تاریخ صدور" },
      { name: "dueDate", label: "تاریخ سررسید" },
    ],
    []
  );

  return (
    <IndexWrapper
      title={title}
      columns={isAdmin ? columnsForAdmin : columnsForUser}
      defaultViewMode="table"
      showIconViews={false}
      repo={new InvoiceRepository()}
      filterOptions={filters}
      dateFilterFields={dateFilters}
    />
  );
}
