import ActionsTable from "@/@Client/Components/common/ActionsTable";
import { Column } from "ndui-ahrom/dist/components/Table/Table";

export const columnsForAdmin: Column[] = [
  { name: "title", label: "عنوان" },
  { name: "status", label: "وضعیت" },
  { name: "priority", label: "اولویت" },
  { name: "type", label: "نوع" },
  {
    name: "actions",
    label: "عملیات",
    render: (row: any) => (
      <ActionsTable
        row={row}
        actions={["view", "edit", "delete"]}
        onView={`/dashboard/supports/${row.id}`}
        onEdit={`/dashboard/supports/${row.id}/update`}
      />
    ),
  },
];
