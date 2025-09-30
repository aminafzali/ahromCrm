import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DIcon from "@/@Client/Components/common/DIcon";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";

export const columnsForSelect: Column[] = [
  {
    name: "name",
    field: "name",
    label: "نام دسته‌بندی",
  },
  {
    name: "parent",
    field: "parent",
    label: "دسته‌بندی والد",
    render: (row) => row.parent?.name || "-",
  },
];

export const columnsForAdmin: Column[] = [
  {
    name: "name",
    field: "name",
    label: "نام دسته‌بندی",
  },
  {
    name: "slug",
    field: "slug",
    label: "نامک",
  },
  {
    name: "parent",
    field: "parent",
    label: "دسته‌بندی والد",
    render: (row) => row.parent?.name || "-",
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        actions={["view", "edit", "delete"]}
        row={row}
        onView={`/dashboard/categories/${row.id}`}
        onEdit={`/dashboard/categories/${row.id}/update`}
        showLabels
      />
    ),
  },
];

export const listItemRender = (row: any) => (
  <Link href={`/dashboard/categories/${row.id}`}>
    <div className="bg-white rounded-lg p-4 border-[1px] border-gray-300 hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{row.name}</h3>
          <p className="text-gray-500 text-sm">
            {row.parent?.name
              ? `زیرمجموعه ${row.parent.name}`
              : "دسته‌بندی اصلی"}
          </p>
        </div>
        <div className="flex gap-4 text-gray-500">
          <div>
            <DIcon icon="fa-box" cdi={false} classCustom="ml-1" />
            {row._count.products} محصول
          </div>
          <div>
            <DIcon icon="fa-folder" cdi={false} classCustom="ml-1" />
            {row._count.children} زیردسته
          </div>
        </div>
      </div>
      {row.description && (
        <p className="text-gray-600 mt-2 text-sm">{row.description}</p>
      )}
    </div>
  </Link>
);
