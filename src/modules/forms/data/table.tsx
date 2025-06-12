import ActionsTable from "@/@Client/Components/common/ActionsTable";
import StatusBadge from "@/@Client/Components/common/StatusBadge";
import { Column } from "ndui-ahrom/dist/components/Table/Table";

export const columnsForSelect: Column[] = [
  {
    name: "name",
    field: "name",
    label: "نام فرم",
  },
  {
    name: "description",
    field: "description",
    label: "توضیحات",
  }
];

export const columnsForAdmin: Column[] = [
  {
    name: "name",
    field: "name",
    label: "نام فرم",
  },
  {
    name: "description",
    field: "description",
    label: "توضیحات",
  },
  {
    name: "isActive",
    field: "isActive",
    label: "وضعیت",
    render: (row) => (
      <StatusBadge status={row.isActive ? "active" : "inactive"} />
    ),
  },
  {
    name: "fields",
    field: "fields",
    label: "تعداد فیلدها",
    render: (row) => row.fields?.length || 0,
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        actions={["view", "edit", "delete"]}
        row={row}
        onView={`/dashboard/forms/${row.id}`}
        onEdit={`/dashboard/forms/${row.id}/update`}
        showLabels
      />
    ),
  },
];