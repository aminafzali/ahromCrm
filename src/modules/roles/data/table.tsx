// مسیر فایل: src/modules/roles/data/table.tsx

import ActionsTable from "@/@Client/Components/common/ActionsTable";
import { Column } from "ndui-ahrom/dist/components/Table/Table";

export const columnsForAdmin: Column[] = [
  {
    name: "name",
    field: "name",
    label: "نام نقش",
  },
  {
    name: "description",
    field: "description",
    label: "توضیحات",
    render: (row) => row.description || "-",
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        actions={["edit", "delete"]}
        row={row}
        onEdit={`/dashboard/roles/${row.id}/update`}
        showLabels
      />
    ),
  },
];


export const columnsForSelect: Column[] = [
  {
    name: "name",
    field: "name",
    label: "نام نقش",
  },
  {
    name: "description",
    field: "description",
    label: "توضیحات",
  }
];
