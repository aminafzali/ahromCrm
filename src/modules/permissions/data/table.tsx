// مسیر فایل: src/modules/permissions/data/table.tsx

import ActionsTable from "@/@Client/Components/common/ActionsTable";
import { Column } from "ndui-ahrom/dist/components/Table/Table";

export const columnsForAdmin: Column[] = [
  {
    name: "action",
    field: "action",
    label: "عمل (Action)",
  },
  {
    name: "module",
    field: "module",
    label: "ماژول",
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
        onEdit={`/dashboard/permissions/${row.id}/update`}
        showLabels
      />
    ),
  },
];
