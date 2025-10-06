import Link from "next/link";

export const columnsForAdmin: any[] = [
  {
    id: "name",
    header: "نام",
    accessorKey: "name",
    cell: ({ row }: any) => (
      <Link className="text-blue-600" href={`/dashboard/document-categories`}>
        {row.original.name}
      </Link>
    ),
  },
  {
    id: "parent",
    header: "والد",
    cell: ({ row }: any) => row.original?.parent?.name || "-",
  },
  {
    id: "children",
    header: "زیرشاخه‌ها",
    cell: ({ row }: any) => row.original?.children?.length || 0,
  },
];

export const listItemRender = (item: any) => {
  return (
    <div className="flex items-center justify-between">
      <div className="font-medium">{item.name}</div>
      <div className="text-xs text-base-content/60">
        {item.parent?.name ? `والد: ${item.parent.name}` : ""}
      </div>
    </div>
  );
};
