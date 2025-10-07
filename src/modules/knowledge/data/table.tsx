import ActionsTable from "@/@Client/Components/common/ActionsTable";
import { Column } from "ndui-ahrom/dist/components/Table/Table";

export const columnsForAdmin: Column[] = [
  {
    name: "title",
    field: "title",
    label: "عنوان",
  },
  {
    name: "slug",
    field: "slug",
    label: "اسلاگ",
  },
  {
    name: "status",
    field: "status",
    label: "وضعیت",
  },
  {
    name: "category",
    field: "category.name",
    label: "دسته",
    render: (row: any) => row.category?.name || "-",
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row: any) => (
      <ActionsTable
        row={row}
        actions={["view", "edit", "delete"]}
        onView={`/dashboard/knowledge/${row.id}`}
        onEdit={`/dashboard/knowledge/${row.id}/update`}
      />
    ),
  },
];

export const listItemRender = (item: any) => {
  return (
    <div className="space-y-1">
      <div className="font-semibold">{item.title}</div>
      <div className="text-xs text-slate-500">
        {item.category?.name || "بدون دسته"}
      </div>
    </div>
  );
};
