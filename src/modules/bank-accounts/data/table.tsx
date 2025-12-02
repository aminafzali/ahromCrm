import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import { Column } from "ndui-ahrom/dist/components/Table/Table";

const maskCard = (card?: string | null) => {
  if (!card) return "-";
  const digits = card.replace(/\s+/g, "");
  if (digits.length < 16) return card;
  return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-****-${digits.slice(12)}`;
};

export const columnsForAdmin: Column[] = [
  {
    name: "title",
    field: "title",
    label: "نام حساب بانکی",
    render: (row) => row.title || "-",
  },
  {
    name: "bankName",
    field: "bankName",
    label: "بانک",
    render: (row) => row.bankName || "-",
  },
  {
    name: "cardNumber",
    field: "cardNumber",
    label: "شماره کارت",
    render: (row) => maskCard(row.cardNumber),
  },
  {
    name: "accountNumber",
    field: "accountNumber",
    label: "شماره حساب",
    render: (row) => row.accountNumber || "-",
  },
  {
    name: "owner",
    field: "workspaceUser.displayName",
    label: "مخاطب",
    render: (row) =>
      row.workspaceUser?.displayName ||
      row.workspaceUser?.user?.name ||
      row.workspaceUser?.user?.phone ||
      "-",
  },
  {
    name: "defaults",
    label: "پیش‌فرض‌ها",
    render: (row) => {
      const badges: string[] = [];
      if (row.isDefaultForReceive) badges.push("پیش‌فرض دریافتی");
      if (row.isDefaultForPay) badges.push("پیش‌فرض پرداختی");
      return badges.length ? badges.join("، ") : "-";
    },
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
        row={row}
        actions={["view", "edit", "delete"]}
        onView={`/dashboard/bank-accounts/${row.id}`}
        onEdit={`/dashboard/bank-accounts/${row.id}/update`}
        showLabels
      />
    ),
  },
];

export const columnsForSelect: Column[] = [
  {
    name: "title",
    field: "title",
    label: "نام حساب بانکی",
    render: (row) => row.title || "-",
  },
  {
    name: "cardNumber",
    field: "cardNumber",
    label: "شماره کارت",
    render: (row) => maskCard(row.cardNumber),
  },
];
