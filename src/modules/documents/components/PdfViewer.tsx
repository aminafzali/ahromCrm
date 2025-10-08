"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import * as pdfjsLib from "pdfjs-dist";
import { useEffect, useRef, useState } from "react";

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfViewerProps {
  url: string;
  onClose: () => void;
}

export default function PdfViewer({ url, onClose }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pdf, setPdf] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [scale, setScale] = useState(1.1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const loadingTask = (pdfjsLib as any).getDocument({
          url,
          cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
        });
        const doc = await loadingTask.promise;
        if (!mounted) return;
        setPdf(doc);
        setNumPages(doc.numPages || 1);
        setLoading(false);
      } catch (err) {
        console.error("PDF loading error:", err);
        setError("خطا در بارگذاری فایل PDF");
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [url]);

  useEffect(() => {
    const render = async () => {
      if (!pdf || !canvasRef.current) return;
      try {
        const p = await pdf.getPage(page);
        const viewport = p.getViewport({ scale });
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.height = viewport.height as number;
        canvas.width = viewport.width as number;
        await p.render({ canvasContext: ctx, viewport }).promise;
      } catch (err) {
        console.error("PDF rendering error:", err);
        setError("خطا در نمایش فایل PDF");
      }
    };
    render();
  }, [pdf, page, scale]);

  const zoomIn = () => setScale((s) => Math.min(2.5, s + 0.15));
  const zoomOut = () => setScale((s) => Math.max(0.6, s - 0.15));
  const prev = () => setPage((p) => Math.max(1, p - 1));
  const next = () => setPage((p) => Math.min(numPages, p + 1));

  if (loading) {
    return (
      <div className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>در حال بارگذاری PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center">
        <div className="text-white text-center">
          <DIcon icon="fa-exclamation-triangle" classCustom="text-4xl mb-4" />
          <p className="mb-4">{error}</p>
          <button onClick={onClose} className="btn btn-primary">
            بستن
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[10000] bg-black/95 flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 text-white border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* "دانلود" و "پرینت" عمداً قرار داده نشده/غیرفعال شده‌اند */}
          <button
            className="opacity-40 cursor-not-allowed"
            aria-label="download-disabled"
          >
            <DIcon icon="fa-download" />
          </button>
          <button
            className="opacity-40 cursor-not-allowed"
            aria-label="print-disabled"
          >
            <DIcon icon="fa-print" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={zoomOut} className="btn btn-xs btn-ghost text-white">
            <DIcon icon="fa-magnifying-glass-minus" />
          </button>
          <span className="text-sm tabular-nums">
            {page} / {numPages}
          </span>
          <button onClick={zoomIn} className="btn btn-xs btn-ghost text-white">
            <DIcon icon="fa-magnifying-glass-plus" />
          </button>
          <button onClick={onClose} className="btn btn-xs btn-ghost text-white">
            <DIcon icon="fa-xmark" />
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto flex items-start justify-center">
        <div className="mx-auto my-4">
          <canvas ref={canvasRef} className="max-w-[95vw] h-auto shadow-lg" />
        </div>
      </div>
      <div className="absolute left-2 bottom-4 flex items-center gap-2">
        <button onClick={prev} className="btn btn-sm">
          قبلی
        </button>
        <button onClick={next} className="btn btn-sm">
          بعدی
        </button>
      </div>
    </div>
  );
}
