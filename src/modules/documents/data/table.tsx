import Link from "next/link";

export const columnsForAdmin: any[] = [
  {
    id: "originalName",
    header: "نام",
    accessorKey: "originalName",
    cell: ({ row }) => (
      <Link
        className="text-blue-600"
        href={`/dashboard/documents/${
          row.original.id || row.original?.id || row.id
        }`}
      >
        {row.original.originalName}
      </Link>
    ),
  },
  {
    id: "mimeType",
    header: "نوع",
    accessorKey: "mimeType",
  },
  {
    id: "size",
    header: "اندازه",
    accessorKey: "size",
    cell: ({ row }) => Number(row.original.size || 0).toLocaleString(),
  },
  {
    id: "category",
    header: "دسته",
    accessorKey: "category.name",
    cell: ({ row }) => row.original?.category?.name || "-",
  },
  {
    id: "download",
    header: "دانلود",
    cell: ({ row }) => (
      <a
        className="text-blue-600"
        href={row.original.url}
        target="_blank"
        rel="noreferrer"
      >
        دانلود
      </a>
    ),
  },
];

export const listItemRender = (item: any) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="font-medium">{item.originalName}</div>
        <div className="text-xs text-base-content/60">{item.mimeType}</div>
      </div>
      <div className="text-sm">
        <a
          className="text-blue-600"
          href={item.url}
          target="_blank"
          rel="noreferrer"
        >
          دانلود
        </a>
      </div>
    </div>
  );
};
