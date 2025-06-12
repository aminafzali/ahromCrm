import ActionsTable from "@/@Client/Components/common/ActionsTable";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";

export const columns: Column[] = [
  {
    name: "name",
    field: "name",
    label: "نام خدمت",
  },
  {
    name: "description",
    field: "description",
    label: "توضیحات",
  },
  {
    name: "basePrice",
    field: "basePrice",
    label: "قیمت پایه",
    render: (row) => `${row.basePrice.toLocaleString()} تومان`,
  },
  {
    name: "isActive",
    field: "isActive",
    label: "وضعیت",
    render: (row) => (
      <span
        className={`py-2 px-4 rounded-lg bg-soft  badge-${
          row.isActive ? "success" : "error"
        }`}
      >
        {row.isActive ? "فعال" : "غیرفعال"}
      </span>
    ),
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        actions={["view", "edit", "delete"]}
        row={row}
        onView={`/dashboard/service-types/${row.id}`}
        onEdit={`/dashboard/service-types/${row.id}/update`}
        showLabels
      />
    ),
  },
];

export const listItemRender = (row: any) => (
  <div className="bg-white p-4 rounded-lg border-2 shadow-sm hover:shadow-md transition-shadow">
    <Link href={`/dashboard/service-types/${row.id}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg">{row.name}</h3>
          {row.description && (
            <p className="text-gray-600 mt-1">{row.description}</p>
          )}
        </div>
        <div className="text-left">
          <div className="font-bold text-lg text-primary">
            {row.basePrice.toLocaleString()} تومان
          </div>
        </div>
      </div>
    </Link>
    <div className="flex justify-end items-center mt-4 border-t-2 pt-4">
      <ActionsTable
        actions={["view", "edit", "delete"]}
        className="justify-between px-4 w-full "
        row={row}
        onView={`/dashboard/service-types/${row.id}`}
        onEdit={`/dashboard/service-types/${row.id}/update`}
        showLabels
      />
    </div>
  </div>
);
