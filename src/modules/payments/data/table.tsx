import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DIcon from "@/@Client/Components/common/DIcon";
import StatusBadge from "@/@Client/Components/common/StatusBadge";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";

export const columnsForAdmin: Column[] = [
  {
    name: "customer",
    field: "user.name",
    label: "نام مشتری",
    render: (row) => (row.user ? row.user.name : "نامشخص"),
  },
  {
    name: "amount",
    field: "amount",
    label: "مبلغ (تومان)",
    render: (row) => row.amount.toLocaleString(),
  },
  {
    name: "method",
    field: "method",
    label: "روش پرداخت",
    render: (row) => {
      const methods = {
        CASH: "نقدی",
        CARD: "کارت",
        TRANSFER: "انتقال",
      };
      return methods[row.method] || row.method;
    },
  },
  {
    name: "type",
    field: "type",
    label: "نوع",
    render: (row) => {
      const methods = {
        RECEIVE: "دریافت",
        PAY: "پرداخت",
      };
      return methods[row.type] || row.type;
    },
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
        actions={["view"]}
        row={row}
        onView={`/dashboard/payments/${row.id}`}
        showLabels
      />
    ),
  },
];

export const listItemRender = (row: any) => (
  <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h3 className="font-semibold">{row.user ? row.user.name : "نامشخص"}</h3>
        <p className="text-gray-600">
          {row.invoice?.request?.serviceType?.name}
        </p>
      </div>
      <div className="text-right">
        <div className="font-bold text-lg text-primary">
          {row.amount.toLocaleString()} تومان
        </div>
        <StatusBadge status={row.status} />
      </div>
    </div>
    <div className="flex justify-between items-center mt-2">
      <div className="text-sm text-gray-500">
        <DIcon icon="fa-calendar" cdi={false} classCustom="ml-1" />
        <DateDisplay date={row.createdAt} />
      </div>
      <Link href={`/dashboard/payments/${row.id}`}>
        <button className="btn btn-ghost btn-sm">
          <DIcon icon="fa-eye" cdi={false} classCustom="ml-2" />
          مشاهده جزئیات
        </button>
      </Link>
    </div>
  </div>
);
