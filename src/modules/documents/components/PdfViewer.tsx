"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import * as pdfjsLib from "pdfjs-dist";
import { useEffect, useRef, useState } from "react";

// Set worker source with fallback
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
  const [useFallback, setUseFallback] = useState(false);

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
        console.log("Loading PDF from:", url);

        const loadingTask = pdfjsLib.getDocument({
          url: url,
          cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
          withCredentials: false,
        });

        const doc = await loadingTask.promise;
        if (!mounted) return;

        console.log("PDF loaded successfully:", doc.numPages, "pages");
        setPdf(doc);
        setNumPages(doc.numPages || 1);
        setPage(1);
        setLoading(false);
      } catch (err) {
        console.error("PDF loading error:", err);
        if (!mounted) return;

        let errorMessage = "خطا در بارگذاری فایل PDF";
        if (err instanceof Error) {
          if (err.message.includes("CORS")) {
            errorMessage = "خطای CORS: فایل PDF قابل دسترسی نیست";
          } else if (err.message.includes("404")) {
            errorMessage = "فایل PDF یافت نشد";
          } else if (err.message.includes("Invalid PDF")) {
            errorMessage = "فایل PDF معتبر نیست";
          }
        }
        setError(errorMessage);
        setLoading(false);

        // Try fallback after 3 seconds
        setTimeout(() => {
          if (!mounted) return;
          console.log("Trying fallback PDF viewer...");
          setUseFallback(true);
          setError(null);
        }, 3000);
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
        console.log("Rendering page:", page, "scale:", scale);
        const p = await pdf.getPage(page);
        const viewport = p.getViewport({ scale });
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          console.error("Could not get canvas context");
          return;
        }

        // Set canvas dimensions
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Render page
        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        await p.render(renderContext).promise;
        console.log("Page rendered successfully");
      } catch (err) {
        console.error("PDF rendering error:", err);
        setError("خطا در نمایش صفحه PDF");
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
          <p className="text-lg mb-2">در حال بارگذاری PDF...</p>
          <p className="text-sm text-gray-300">لطفاً صبر کنید</p>
        </div>
      </div>
    );
  }

  // Fallback PDF viewer using iframe
  if (useFallback) {
    return (
      <div className="fixed inset-0 z-[10000] bg-black/95 flex flex-col">
        <div className="flex items-center justify-between px-3 py-2 text-white border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-sm text-yellow-400">حالت جایگزین</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="btn btn-xs btn-ghost text-white"
            >
              <DIcon icon="fa-xmark" />
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <iframe
            src={url}
            className="w-full h-full border-0"
            title="PDF Viewer"
            onError={() => setError("خطا در نمایش PDF با حالت جایگزین")}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center">
        <div className="text-white text-center max-w-md mx-auto p-6">
          <DIcon
            icon="fa-exclamation-triangle"
            classCustom="text-6xl mb-4 text-red-400"
          />
          <h3 className="text-xl font-semibold mb-2">خطا در نمایش PDF</h3>
          <p className="mb-6 text-gray-300">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                setUseFallback(false);
                window.location.reload();
              }}
              className="btn btn-outline text-white border-white hover:bg-white hover:text-black"
            >
              تلاش مجدد
            </button>
            <button onClick={onClose} className="btn btn-primary">
              بستن
            </button>
          </div>
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
      <div className="flex-1 min-h-0 overflow-auto flex items-start justify-center p-4">
        <div className="mx-auto">
          <canvas
            ref={canvasRef}
            className="max-w-[95vw] max-h-[85vh] h-auto shadow-lg bg-white rounded"
            style={{ maxWidth: "100%", height: "auto" }}
          />
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
