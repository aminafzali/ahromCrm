// مسیر فایل: src/modules/documents/data/table.tsx
import DIcon from "@/@Client/Components/common/DIcon";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import { Column } from "ndui-ahrom/dist/components/Table/Table";
import Link from "next/link";
import React, { useState } from "react";
import PdfViewer from "../components/PdfViewer";

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
    render: (row: any) => {
      const mt = (row.mimeType || "").toLowerCase();
      let typeText = "سند";
      let icon = "fa-file";
      let color = "text-gray-500";

      if (mt.startsWith("image/")) {
        typeText = "تصویر";
        icon = "fa-image";
        color = "text-blue-500";
      } else if (mt.includes("pdf")) {
        typeText = "PDF";
        icon = "fa-file-pdf";
        color = "text-red-500";
      } else if (mt.includes("excel") || mt.includes("spreadsheet")) {
        typeText = "Excel";
        icon = "fa-file-excel";
        color = "text-green-500";
      } else if (
        mt.includes("word") ||
        mt.includes("msword") ||
        mt.includes("officedocument")
      ) {
        typeText = "Word";
        icon = "fa-file-word";
        color = "text-blue-600";
      } else if (mt.includes("video")) {
        typeText = "ویدئو";
        icon = "fa-file-video";
        color = "text-purple-500";
      } else if (mt.includes("text")) {
        typeText = "متن";
        icon = "fa-file-lines";
        color = "text-gray-600";
      }

      return (
        <div className="flex items-center gap-2">
          <DIcon icon={icon} classCustom={`text-lg ${color}`} />
          <span>{typeText}</span>
        </div>
      );
    },
  },
  {
    name: "size",
    field: "size",
    label: "اندازه",
    render: (row: any) => {
      const sizeInBytes = Number(row.size || 0);
      if (sizeInBytes === 0) return "-";

      const units = ["B", "KB", "MB", "GB"];
      let i = 0;
      let size = sizeInBytes;
      while (size >= 1024 && i < units.length - 1) {
        size /= 1024;
        i++;
      }
      return `${size.toFixed(1)} ${units[i]}`;
    },
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
      <div className="flex items-center gap-3">
        <a
          className="flex items-center gap-1 text-green-600 hover:text-green-700 transition-colors"
          href={row.url}
          target="_blank"
          rel="noreferrer"
        >
          <DIcon icon="fa-download" classCustom="text-sm" />
          <span className="text-sm">دانلود</span>
        </a>
        <Link
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
          href={`/dashboard/documents/${row.id}`}
        >
          <DIcon icon="fa-eye" classCustom="text-sm" />
          <span className="text-sm">جزئیات</span>
        </Link>
      </div>
    ),
  },
];

// Enhanced Image Modal Component
const ImageModal = ({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) => {
  const [bgColor, setBgColor] = useState("black");
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (factor: number) => {
    setZoom((prev) => Math.max(0.1, Math.min(5, prev * factor)));
  };

  const resetPosition = () => {
    setPosition({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        backgroundColor: bgColor === "black" ? "#000000" : "#ffffff",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={onClose}
          className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
          aria-label="بستن"
        >
          <DIcon icon="fa-xmark" classCustom="text-2xl" />
        </button>
        <button
          onClick={() => setBgColor("white")}
          className={`w-8 h-8 rounded border-2 ${
            bgColor === "white" ? "border-blue-500" : "border-gray-400"
          } bg-white`}
          aria-label="پس‌زمینه سفید"
        />
        <button
          onClick={() => setBgColor("black")}
          className={`w-8 h-8 rounded border-2 ${
            bgColor === "black" ? "border-blue-500" : "border-gray-400"
          } bg-black`}
          aria-label="پس‌زمینه سیاه"
        />
        <button
          onClick={() => handleZoom(1.2)}
          className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
          aria-label="بزرگنمایی"
        >
          <DIcon icon="fa-magnifying-glass-plus" classCustom="text-xl" />
        </button>
        <button
          onClick={() => handleZoom(0.8)}
          className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
          aria-label="کوچکنمایی"
        >
          <DIcon icon="fa-magnifying-glass-minus" classCustom="text-xl" />
        </button>
        <button
          onClick={resetPosition}
          className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
          aria-label="بازنشانی"
        >
          <DIcon icon="fa-rotate-right" classCustom="text-xl" />
        </button>
      </div>

      {/* Image */}
      <img
        src={src}
        alt={alt}
        className="max-w-[90vw] max-h-[80vh] object-contain select-none"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
          transition: isDragging ? "none" : "transform 0.1s ease-out",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        draggable={false}
      />
    </div>
  );
};

const DocumentCard = ({ item }: { item: any }) => {
  const [showImage, setShowImage] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
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
    <div className="card bg-white border rounded-xl overflow-hidden h-[280px] flex flex-col">
      <div
        className={`relative w-full aspect-square ${squareBg} flex items-center justify-center`}
        style={{ minHeight: 0 }}
      >
        {type === "image" ? (
          <img
            src={item.url}
            alt={item.originalName}
            className="w-full h-full object-cover"
          />
        ) : (
          <DIcon icon={icon} classCustom="text-white text-7xl md:text-8xl" />
        )}
        {type === "image" && (
          <button
            className="absolute bottom-2 left-2 right-2 bg-black/50 text-white text-xs py-1 rounded-lg hover:bg-black/60 transition-colors"
            onClick={() => setShowImage(true)}
          >
            مشاهده تمام صفحه
          </button>
        )}
        {type === "pdf" && (
          <button
            className="absolute bottom-2 left-2 right-2 bg-black/50 text-white text-xs py-1 rounded-lg hover:bg-black/60 transition-colors"
            onClick={() => setShowPdf(true)}
          >
            مشاهده فایل
          </button>
        )}
      </div>
      <div className="p-3 flex flex-col gap-2 flex-grow">
        <div
          className="font-semibold text-sm line-clamp-2"
          title={item.originalName}
        >
          {item.originalName}
        </div>
        <div className="text-xs text-slate-500">
          {(item.entityType && `مرتبط با ${item.entityType}`) || ""}
          {item.entityId ? ` #${item.entityId}` : ""}
        </div>
        <div className="mt-1 flex items-center gap-2 pt-0">
          <a
            className="flex items-center gap-1 text-green-600 hover:text-green-700 transition-colors"
            href={item.url}
            target="_blank"
            rel="noreferrer"
          >
            <DIcon icon="fa-download" classCustom="text-sm" />
            <span className="text-sm hidden md:inline">دانلود</span>
          </a>
          <Link
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
            href={`/dashboard/documents/${item.id}`}
          >
            <DIcon icon="fa-eye" classCustom="text-sm" />
            <span className="text-sm hidden md:inline">جزئیات</span>
          </Link>
        </div>
      </div>

      {showImage && (
        <ImageModal
          src={item.url}
          alt={item.originalName}
          onClose={() => setShowImage(false)}
        />
      )}

      {showPdf && (
        <PdfViewer url={item.url} onClose={() => setShowPdf(false)} />
      )}
    </div>
  );
};

export const listItemRender = (item: any) => <DocumentCard item={item} />;
