import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DIcon from "@/@Client/Components/common/DIcon";
import StatusBadge from "@/@Client/Components/common/StatusBadge";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";

const invoiceTypeMap = {
  SALES: "فروش",
  PURCHASE: "خرید",
  PROFORMA: "پیش‌فاکتور",
  RETURN_SALES: "مرجوعی فروش",
  RETURN_PURCHASE: "مرجوعی خرید",
};
export const columnsForAdmin: Column[] = [
  {
    name: "name",
    field: "name",
    label: "نام فاکتور",
    render: (row) => row.name || "نامشخص",
  },
  {
    name: "type",
    field: "type",
    label: "نوع فاکتور",
    render: (row) => invoiceTypeMap[row.type] || "نامشخص",
  },
  {
    name: "customer",
    field: "workspaceUser",
    label: "نام مشتری",
    render: (row) =>
      row.workspaceUser.displayName || row.workspaceUser.name || "نامشخص",
  },
  // {
  //   name: "service",
  //   field: "request",
  //   label: "نوع خدمات",
  //   render: (row) => row.request?.serviceType.name || "بدون خدمت",
  // },
  {
    name: "total",
    field: "total",
    label: "مبلغ کل (تومان)",
    render: (row) => row.total.toLocaleString(),
  },
  {
    name: "status",
    field: "status",
    label: "وضعیت",
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    name: "issueDate",
    field: "issueDate",
    label: "تاریخ فاکتور",
    render: (row) => <DateDisplay date={row.issueDate} />,
  },
  {
    name: "dueDate",
    field: "dueDate",
    label: "تاریخ سر رسید ",
    render: (row) => <DateDisplay date={row.dueDate} />,
  },
  // {
  //   name: "createdAt",
  //   field: "createdAt",
  //   label: "تاریخ ایجاد",
  //   render: (row) => <DateDisplay date={row.createdAt} />,
  // },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        actions={["view", "edit", "delete"]}
        row={row}
        onView={`/dashboard/invoices/${row.id}`}
        onEdit={`/dashboard/invoices/${row.id}/update`}
        showLabels
      />
    ),
  },
];

export const columnsForUser: Column[] = [
  {
    name: "customer",
    field: "workspaceUser",
    label: "نام مشتری",
    render: (row) =>
      row.workspaceUser.user.name || row.workspaceUser.user.phone || "نامشخص",
  },
  {
    name: "request",
    field: "request",
    label: "نوع خدمات",
    render: (row) => row.request.serviceType.name,
  },
  {
    name: "total",
    field: "total",
    label: "مبلغ کل (تومان)",
    render: (row) => row.total.toLocaleString(),
  },
  {
    name: "status",
    field: "status",
    label: "وضعیت",
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    name: "date",
    field: "createdAt",
    label: "تاریخ",
    render: (row) => <DateDisplay date={row.createdAt} />,
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        actions={["view", "edit", "delete"]}
        row={row}
        onView={`/panel/invoices/${row.id}`}
        showLabels
      />
    ),
  },
];

export const listItemRender = (row: any) => (
  <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h3 className="font-semibold">{row.workspaceUser.name || "نامشخص"}</h3>
        <p className="text-gray-600">{row.request.serviceType.name}</p>
      </div>
      <div className="text-right">
        <div className="font-bold text-lg text-primary">
          {row.total.toLocaleString()} تومان
        </div>
        <StatusBadge status={row.status} />
      </div>
    </div>
    <div className="flex justify-between items-center mt-2">
      <div className="text-sm text-gray-500">
        <DIcon icon="fa-calendar" cdi={false} classCustom="ml-1" />
        <DateDisplay date={row.createdAt} />
      </div>
      <Link href={`/dashboard/invoices/${row.id}`}>
        <button className="btn btn-ghost btn-sm">
          <DIcon icon="fa-eye" cdi={false} classCustom="ml-2" />
          مشاهده جزئیات
        </button>
      </Link>
    </div>
  </div>
);
