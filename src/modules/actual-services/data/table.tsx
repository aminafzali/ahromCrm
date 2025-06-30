// مسیر فایل: src/modules/actual-services/data/table.tsx

import ActionsTable from "@/@Client/Components/common/ActionsTable";
import { Column } from "ndui-ahrom/dist/components/Table/Table";

export const columnsForAdmin: Column[] = [
  {
    name: "name",
    field: "name",
    label: "نام خدمت",
  },
  {
    name: "price",
    field: "price",
    label: "قیمت",
    render: (row) => <span>{row.price} تومان</span>,
  },
  {
    name: "serviceType",
    field: "serviceType.name",
    label: "نوع خدمت والد",
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        actions={["view", "edit", "delete"]}
        row={row}
        onView={`/dashboard/actual-services/${row.id}`}
        onEdit={`/dashboard/actual-services/${row.id}/update`}
        showLabels
      />
    ),
  },
];
