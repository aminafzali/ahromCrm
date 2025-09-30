import ActionsTable from "@/@Client/Components/common/ActionsTable";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";

export const columns: Column[] = [
  {
    name: "name",
    field: "name",
    label: "نام وضعیت",
  },
  {
    name: "color",
    field: "color",
    label: "رنگ",
    render: (row) => (
      <div className="flex items-center">
        <div
          className="w-6 h-6 rounded-full mr-2"
          style={{ backgroundColor: row.color }}
        ></div>
        {row.color}
      </div>
    ),
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        actions={["view", "edit", "delete"]}
        row={row}
        onView={`/dashboard/statuses/${row.id}`}
        onEdit={`/dashboard/statuses/${row.id}/update`}
        showLabels
      />
    ),
  },
];

export const listItemRender = (row: any) => (
  <div className="bg-white p-4 rounded-lg border-2 shadow-sm hover:shadow-md transition-shadow">
    <Link href={`/dashboard/statuses/${row.id}`}>
      <div className="flex justify-between mb-3">
        <div className="flex">
          <div
            className="w-6 h-6 rounded-full mx-2"
            style={{ backgroundColor: row.color }}
          ></div>
          <h3 className={`font-semibold text-md text-${row.color}`}>
            {row.name}
          </h3>
        </div>
      </div>
    </Link>
    <div className="flex items-center mt-4 border-t-2 pt-4">
      <ActionsTable
        actions={["view", "edit", "delete"]}
        className="justify-between px-4 w-full "
        row={row}
        onView={`/dashboard/statuses/${row.id}`}
        onEdit={`/dashboard/statuses/${row.id}/update`}
        showLabels
      />
    </div>
  </div>
);
