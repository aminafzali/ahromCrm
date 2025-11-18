"use client";

import { DetailPageWrapper } from "@/@Client/Components/wrappers";
// import { useChat } from "@/modules/chat/hooks/useChat"; // Removed: Chat module deprecated
import CommentsThread from "@/modules/comments/components/Thread";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import EditForm from "../../components/EditForm";
import FileViewer from "../../components/FileViewer";
import TeamPermissionForm from "../../components/TeamPermissionForm";
import { useDocument } from "../../hooks/useDocument";

export default function DocumentViewPage({ id }: { id: number }) {
  const { getById, remove, loading } = useDocument();
  const [doc, setDoc] = useState<any | null>(null);
  const [showPdf, setShowPdf] = useState(false);
  const [showFileViewer, setShowFileViewer] = useState(false);
  // const { repo: chatRepo } = useChat(); // Removed: Chat module deprecated
  const router = useRouter();

  const load = async () => {
    const data = await getById(id);
    if (data) setDoc(data);
  };

  useEffect(() => {
    load();
  }, []);

  const getFileType = () => {
    if (!doc) return "unknown";
    const mt = (doc.mimeType || "").toLowerCase();
    const ext = (doc.originalName || "").split(".").pop()?.toLowerCase() || "";
    // Check SVG first (before image)
    if (
      mt === "image/svg+xml" ||
      mt === "image/svg" ||
      ext === "svg" ||
      doc.originalName?.toLowerCase().endsWith(".svg")
    )
      return "svg";
    if (mt.startsWith("image/")) return "image";
    if (mt.includes("pdf")) return "pdf";
    if (
      mt.includes("word") ||
      mt.includes("msword") ||
      mt.includes("officedocument") ||
      ext === "doc" ||
      ext === "docx"
    )
      return "doc";
    if (mt.includes("excel") || mt.includes("spreadsheet") || ext === "xlsx")
      return "excel";
    if (mt.includes("video")) return "video";
    if (mt.includes("text") || ext === "txt" || ext === "csv") return "text";
    return "other";
  };

  const isSupportedByFileViewer = () => {
    if (!doc) return false;
    const mt = (doc.mimeType || "").toLowerCase();
    const ext = (doc.originalName || "").split(".").pop()?.toLowerCase() || "";
    // DOC, DOCX, PDF, and SVG files are NOT supported for viewing
    const isDoc = ext === "doc" || mt.includes("application/msword");
    const isDocx = ext === "docx" || mt.includes("wordprocessingml");
    const isPdf = ext === "pdf" || mt.includes("pdf");
    const isSvg = ext === "svg" || mt.includes("image/svg+xml");
    if (isDoc || isDocx || isPdf || isSvg) return false;

    return (
      mt.includes("text/plain") ||
      ext === "txt" ||
      mt.includes("spreadsheetml") ||
      ext === "xlsx" ||
      mt.includes("text/csv") ||
      ext === "csv" ||
      mt.includes("video/") ||
      ["mp4", "webm", "ogg", "mov"].includes(ext)
    );
  };

  const display = useMemo(() => {
    if (!doc) return {} as any;
    const fileType = getFileType();
    const mt = (doc.mimeType || "").toLowerCase();
    return {
      نام: doc.originalName,
      نوع: doc.mimeType,
      اندازه: Number(doc.size || 0).toLocaleString(),
      دسته: doc.category?.name || "-",
      موجودیت: doc.entityType ? `${doc.entityType}#${doc.entityId}` : "-",
      دانلود: (
        <a
          className="text-blue-600"
          href={doc.url}
          target="_blank"
          rel="noreferrer"
        >
          دانلود
        </a>
      ),
      مشاهده:
        // PDF, DOCX, DOC, and SVG don't have view buttons - only download
        isSupportedByFileViewer() &&
        fileType !== "pdf" &&
        fileType !== "doc" &&
        fileType !== "svg" ? (
          <button
            className="text-blue-600 hover:underline"
            onClick={() => setShowFileViewer(true)}
          >
            مشاهده فایل
          </button>
        ) : fileType === "image" ? (
          <img
            src={doc.url}
            alt={doc.originalName}
            className="max-w-md max-h-96 rounded-lg shadow-lg"
          />
        ) : null,
    } as Record<string, any>;
  }, [doc]);

  return (
    <div className="p-4 space-y-4">
      <DetailPageWrapper
        data={display}
        title="جزئیات سند"
        loading={loading}
        error={undefined}
        onDelete={async () => {
          await remove(id);
        }}
        editUrl={undefined as any}
      />
      <div className="grid md:grid-cols-2 gap-4">
        <EditForm id={id} onSaved={load} />
        <TeamPermissionForm id={id} onChanged={load} />
      </div>
      {doc?.id && (
        <div className="mt-8 space-y-4">
          <CommentsThread entityType="Document" entityId={Number(id)} />
          {/* TODO: Add internal-chat link for this document */}
        </div>
      )}

      {/* PDF viewer removed - only download available */}
      {showFileViewer && doc && (
        <FileViewer
          url={doc.url}
          mimeType={doc.mimeType || ""}
          fileName={doc.originalName || "فایل"}
          onClose={() => setShowFileViewer(false)}
        />
      )}
    </div>
  );
}
