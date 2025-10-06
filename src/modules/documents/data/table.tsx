// مسیر فایل: src/modules/documents/data/table.tsx
import ActionsTable from "@/@Client/Components/common/ActionsTable";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";

export const columnsForAdmin: Column[] = [
  {
    name: "originalName",
    field: "originalName",
    label: "نام",
    render: (row: any) => (
      <Link className="text-blue-600" href={`/dashboard/documents/${row.id}`}>
        {row.originalName}
      </Link>
    ),
  },
  {
    name: "mimeType",
    field: "mimeType",
    label: "نوع",
  },
  {
    name: "size",
    field: "size",
    label: "اندازه (بایت)",
    render: (row: any) => Number(row.size || 0).toLocaleString(),
  },
  {
    name: "category",
    field: "category.name",
    label: "دسته",
    render: (row: any) => row.category?.name || "-",
  },
  {
    name: "createdAt",
    field: "createdAt",
    label: "تاریخ ایجاد",
    render: (row: any) => <DateDisplay date={row.createdAt} />,
  },
  {
    name: "actions",
    label: "عملیات",
    render: (row: any) => (
      <ActionsTable
        actions={["view", "delete"]}
        row={row}
        onView={`/dashboard/documents/${row.id}`}
        showLabels
      />
    ),
  },
];

export const listItemRender = (item: any) => {
  const type = (() => {
    const mt = (item.mimeType || "").toLowerCase();
    if (mt.startsWith("image/")) return "image";
    if (mt.includes("pdf")) return "pdf";
    if (mt.includes("excel") || mt.includes("spreadsheet")) return "excel";
    if (
      mt.includes("word") ||
      mt.includes("msword") ||
      mt.includes("officedocument")
    )
      return "doc";
    if (mt.includes("video")) return "video";
    if (mt.includes("text")) return "text";
    return "other";
  })();

  const squareBg =
    type === "image"
      ? "bg-slate-200"
      : type === "pdf"
      ? "bg-red-500"
      : type === "excel"
      ? "bg-emerald-400"
      : type === "doc"
      ? "bg-blue-400"
      : type === "video"
      ? "bg-green-600"
      : "bg-slate-500";

  const icon =
    type === "image"
      ? "fa-image"
      : type === "pdf"
      ? "fa-file-pdf"
      : type === "excel"
      ? "fa-file-excel"
      : type === "doc"
      ? "fa-file-word"
      : type === "video"
      ? "fa-file-video"
      : type === "text"
      ? "fa-file-lines"
      : "fa-file";

  return (
    <div className="card bg-white border rounded-xl overflow-hidden">
      <div
        className={`w-full aspect-square ${squareBg} flex items-center justify-center`}
      >
        {type === "image" ? (
          // نمایش تصویر بندانگشتی
          <img
            src={item.url}
            alt={item.originalName}
            className="w-full h-full object-cover"
          />
        ) : (
          // آیکن سفید برای انواع دیگر
          <i className={`fa-solid ${icon} text-white text-6xl`} />
        )}
      </div>
      <div className="p-3 space-y-2">
        <div
          className="font-semibold text-sm line-clamp-1"
          title={item.originalName}
        >
          {item.originalName}
        </div>
        <div className="text-xs text-slate-500">
          {(item.entityType && `مرتبط با ${item.entityType}`) || ""}
          {item.entityId ? ` #${item.entityId}` : ""}
        </div>
        <div className="flex items-center gap-2 pt-1">
          <a
            className="btn btn-sm btn-primary text-white"
            href={item.url}
            target="_blank"
            rel="noreferrer"
          >
            دانلود
          </a>
          <Link
            className="btn btn-sm btn-secondary text-white"
            href={`/dashboard/documents/${item.id}`}
          >
            جزئیات
          </Link>
        </div>
      </div>
    </div>
  );
};
