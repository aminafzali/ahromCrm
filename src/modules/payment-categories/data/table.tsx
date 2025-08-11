// مسیر فایل: src/modules/payment-categories/data/table.tsx

import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import { Column } from "ndui-ahrom/dist/components/Table/Table";

// تابع کمکی برای نمایش زیبای نوع دسته‌بندی
const getTypeLabel = (type: string) => {
  switch (type) {
    case "INCOME":
      return <span className="badge badge-success">درآمد</span>;
    case "EXPENSE":
      return <span className="badge badge-error">هزینه</span>;
    case "TRANSFER":
      return <span className="badge badge-info">انتقال</span>;
    default:
      return <span className="badge">نامشخص</span>;
  }
};

export const columnsForAdmin: Column[] = [
  { name: "name", field: "name", label: "نام" },
  { name: "slug", field: "slug", label: "اسلاگ" },
  {
    name: "type",
    field: "type",
    label: "نوع",
    render: (row) => getTypeLabel(row.type),
  },
  {
    name: "parent",
    field: "parent.name",
    label: "والد",
    render: (row) => row.parent?.name || "-",
  },
  {
    name: "paymentsCount",
    label: "تعداد پرداخت‌ها",
    render: (row: any) => row._count?.payments || 0,
  },
  {
    name: "createdAt",
    field: "createdAt",
    label: "تاریخ ایجاد",
    render: (row) => <DateDisplay date={row.createdAt} />,
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        actions={["edit", "delete"]}
        row={row}
        onEdit={`/dashboard/payment-categories/${row.id}/update`}
        showLabels
      />
    ),
  },
];
