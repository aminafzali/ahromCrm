import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DIcon from "@/@Client/Components/common/DIcon";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";

export const columnsForSelect: Column[] = [
  {
    name: "name",
    field: "name",
    label: "نام برند",
  },
  {
    name: "website",
    field: "website",
    label: "وب‌سایت",
  },
];

export const columnsForAdmin: Column[] = [
  {
    name: "name",
    field: "name",
    label: "نام برند",
  },
  {
    name: "website",
    field: "website",
    label: "وب‌سایت",
    render: (row) => (
      row.website ? (
        <a href={row.website} target="_blank" rel="noopener noreferrer" className="text-primary">
          {row.website}
        </a>
      ) : "-"
    ),
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        actions={["view", "edit", "delete"]}
        row={row}
        onView={`/dashboard/brands/${row.id}`}
        onEdit={`/dashboard/brands/${row.id}/update`}
        showLabels
      />
    ),
  },
];

export const listItemRender = (row: any) => (
  <Link href={`/dashboard/brands/${row.id}`}>
    <div className="bg-white rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{row.name}</h3>
          {row.website && (
            <a href={row.website} target="_blank" rel="noopener noreferrer" className="text-primary text-sm">
              <DIcon icon="fa-globe" cdi={false} classCustom="ml-2" />
              {row.website}
            </a>
          )}
        </div>
        <div className="text-gray-500">
          <DIcon icon="fa-box" cdi={false} classCustom="ml-1" />
          {row._count.products} محصول
        </div>
      </div>
      {row.description && (
        <p className="text-gray-600 mt-2 text-sm">{row.description}</p>
      )}
    </div>
  </Link>
);