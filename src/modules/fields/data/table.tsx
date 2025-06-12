import ActionsTable from "@/@Client/Components/common/ActionsTable";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";
import { getLabelByValue } from "./labels";

export const columnsForSelect: Column[] = [
  {
    name: "label",
    field: "label",
    label: "نام",
  },
  {
    name: "type",
    field: "type",
    label: "نوع",
    render(row) {
      return <span>{getLabelByValue(row.type)}</span>;
    },
  },
];

export const columnsForAdmin: Column[] = [
  {
    name: "label",
    field: "label",
    label: "نام برچسب",
  },
  {
    name: "type",
    field: "type",
    label: "نوع",
    render(row) {
      return <span>{getLabelByValue(row.type)}</span>;
    },
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        actions={["view", "edit", "delete"]}
        row={row}
        onView={`/dashboard/fields/${row.id}`}
        onEdit={`/dashboard/fields/${row.id}/update`}
        showLabels
      />
    ),
  },
];

export const listItemRender = (row: any) => (
  <Link href={`/dashboard/fields/${row.id}`}>
    <div
      className={`bg-white rounded-lg hover:shadow-sm transition-shadow p-2`}
    >
      <h3 className="text-gray-700 text-md">{row.label || "نامشخص"}</h3>
      <h3 className="text-primary text-md">{getLabelByValue(row.type)}</h3>
      <h3 className="text-gray-400 text-sm py-2">{row.description || ""}</h3>
    </div>
  </Link>
);
