import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DIcon from "@/@Client/Components/common/DIcon";
import StatusBadge from "@/@Client/Components/common/StatusBadge";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";

export const columnsForAdmin: Column[] = [
  {
    name: "chequeNumber",
    field: "chequeNumber",
    label: "شماره چک",
    render: (row) => row.chequeNumber,
  },
  {
    name: "customer",
    field: "workspaceUser.displayName",
    label: "نام مشتری",
    render: (row) =>
      row.workspaceUser ? row.workspaceUser.displayName : "نامشخص",
  },
  {
    name: "amount",
    field: "amount",
    label: "مبلغ (تومان)",
    render: (row) => row.amount.toLocaleString(),
  },
  {
    name: "dueDate",
    field: "dueDate",
    label: "تاریخ سررسید",
    render: (row) => <DateDisplay date={row.dueDate} />,
  },
  {
    name: "direction",
    field: "direction",
    label: "جهت",
    render: (row) => {
      const directions = {
        INCOMING: "دریافتی",
        OUTGOING: "پرداختی",
      };
      return directions[row.direction] || row.direction;
    },
  },
  {
    name: "status",
    field: "status",
    label: "وضعیت",
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    name: "bankAccount",
    field: "bankAccount",
    label: "حساب بانکی",
    render: (row) =>
      row.bankAccount ? row.bankAccount.title : "نامشخص",
  },
  {
    name: "date",
    field: "createdAt",
    label: "تاریخ ایجاد",
    render: (row) => <DateDisplay date={row.createdAt} />,
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        actions={["view"]}
        row={row}
        onView={`/dashboard/cheques/${row.id}`}
        showLabels
      />
    ),
  },
];

export const listItemRender = (row: any) => {
  const isOverdue = new Date(row.dueDate) < new Date() && row.status !== "CLEARED" && row.status !== "CANCELLED";
  const isNearDue = new Date(row.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && !isOverdue && row.status !== "CLEARED" && row.status !== "CANCELLED";

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow ${isOverdue ? 'border-l-4 border-red-500' : isNearDue ? 'border-l-4 border-yellow-500' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold">
            چک شماره {row.chequeNumber}
          </h3>
          <p className="text-gray-600">
            {row.workspaceUser ? row.workspaceUser.displayName : "نامشخص"}
          </p>
          {row.bankName && (
            <p className="text-sm text-gray-500">بانک: {row.bankName}</p>
          )}
        </div>
        <div className="text-right">
          <div className="font-bold text-lg text-primary">
            {row.amount.toLocaleString()} تومان
          </div>
          <StatusBadge status={row.status} />
          {isOverdue && (
            <span className="badge badge-error badge-sm mt-1">عقب‌افتاده</span>
          )}
          {isNearDue && !isOverdue && (
            <span className="badge badge-warning badge-sm mt-1">نزدیک سررسید</span>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center mt-2">
        <div className="text-sm text-gray-500">
          <DIcon icon="fa-calendar" cdi={false} classCustom="ml-1" />
          سررسید: <DateDisplay date={row.dueDate} />
        </div>
        <Link href={`/dashboard/cheques/${row.id}`}>
          <button className="btn btn-ghost btn-sm">
            <DIcon icon="fa-eye" cdi={false} classCustom="ml-2" />
            مشاهده جزئیات
          </button>
        </Link>
      </div>
    </div>
  );
};

