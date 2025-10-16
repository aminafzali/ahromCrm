import ActionsTable from "@/@Client/Components/common/ActionsTable";
import { Column } from "ndui-ahrom/dist/components/Table/Table";

export const columnsForAdmin: Column[] = [
  { name: "name", field: "name", label: "نام" },
  {
    name: "parent",
    field: "parent.name",
    label: "والد",
    render: (row) => row.parent?.name || "-",
  },
  {
    name: "supportInfoCount",
    label: "تعداد تیکت‌ها",
    render: (row: any) => row._count?.supportInfo || 0,
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        actions={["view", "edit", "delete"]}
        row={row}
        onView={`/dashboard/support-info-categories/${row.id}`}
        onEdit={`/dashboard/support-info-categories/${row.id}/update`}
        showLabels
      />
    ),
  },
];

export const columnsForSelect: Column[] = [
  { name: "name", field: "name", label: "نام دسته‌بندی" },
  {
    name: "parent",
    field: "parent.name",
    label: "والد",
    render: (row) => row.parent?.name || "-",
  },
];
