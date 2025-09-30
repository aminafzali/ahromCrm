import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DIcon from "@/@Client/Components/common/DIcon";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";

export const columnsForSelect: Column[] = [
  {
    name: "name",
    field: "name",
    label: "نام محصول",
  },
  {
    name: "price",
    field: "price",
    label: "قیمت",
    render: (row) => row.price.toLocaleString() + " تومان",
  },
];

export const columnsForAdmin: Column[] = [
  {
    name: "name",
    field: "name",
    label: "نام محصول",
  },
  {
    name: "brand",
    field: "brand",
    label: "برند",
    render: (row) => row.brand?.name || "-",
  },
  {
    name: "category",
    field: "category",
    label: "دسته‌بندی",
    render: (row) => row.category?.name || "-",
  },
  {
    name: "price",
    field: "price",
    label: "قیمت",
    render: (row) => row.price.toLocaleString() + " تومان",
  },
  {
    name: "stock",
    field: "stock",
    label: "موجودی",
  },
  {
    name: "isActive",
    field: "isActive",
    label: "وضعیت",
    render: (row) => (row.isActive ? "فعال" : "غیرفعال"),
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row) => (
      <ActionsTable
        actions={["view", "edit", "delete"]}
        row={row}
        onView={`/dashboard/products/${row.id}`}
        onEdit={`/dashboard/products/${row.id}/update`}
        showLabels
      />
    ),
  },
];

export const listItemRender = (row: any) => (
  <Link href={`/dashboard/products/${row.id}`}>
    <div className="bg-white rounded-lg hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {row.images?.[0] && (
          <img
            src={row.images[0].url}
            alt={row.images[0].alt || row.name}
            className="w-28 h-28 object-cover rounded"
          />
        )}
        <div className="flex-1 p-2">
          <h3 className="text-md font-semibold">{row.name}</h3>
          <div className="flex gap-4 text-sm text-gray-600 mt-2">
            {row.brand && (
              <span>
                <DIcon icon="fa-tag" cdi={false} classCustom="ml-1" />
                {row.brand.name}
              </span>
            )}
            {row.category && (
              <span>
                <DIcon icon="fa-folder" cdi={false} classCustom="ml-1" />
                {row.category.name}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-primary font-semibold">
              {row.price.toLocaleString()} تومان
            </span>
            <span
              className={row.stock > 0 ? "text-primary" : "text-error text-sm"}
            >
              {row.stock > 0 ? `${row.stock} عدد ` : "ناموجود"}
            </span>
          </div>
        </div>
      </div>
    </div>
  </Link>
);
