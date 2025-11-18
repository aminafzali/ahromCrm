"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import * as pdfjsLib from "pdfjs-dist";
import { useCallback, useEffect, useRef, useState } from "react";

// Configure PDF.js worker
if (typeof window !== "undefined") {
  const pdfjsVersion = pdfjsLib.version;
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;
}

interface PdfViewerProps {
  url: string;
  onClose: () => void;
}

export default function PdfViewer({ url, onClose }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  const [pdf, setPdf] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Load PDF document
  useEffect(() => {
    let isMounted = true;
    let loadingTask: any = null;

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        loadingTask = pdfjsLib.getDocument({
          url: url,
          httpHeaders: {},
          withCredentials: false,
        });

        const pdfDoc = await loadingTask.promise;

        if (!isMounted) return;

        setPdf(pdfDoc);
        setNumPages(pdfDoc.numPages);
        setPage(1);
        setLoading(false);
      } catch (err: any) {
        console.error("PDF loading error:", err);
        if (!isMounted) return;

        let errorMessage = "خطا در بارگذاری فایل PDF";
        if (err?.message) {
          if (
            err.message.includes("CORS") ||
            err.message.includes("Failed to fetch")
          ) {
            errorMessage = "خطای CORS: فایل PDF قابل دسترسی نیست";
          } else if (
            err.message.includes("404") ||
            err.message.includes("Not Found")
          ) {
            errorMessage = "فایل PDF یافت نشد";
          } else if (
            err.message.includes("Invalid PDF") ||
            err.message.includes("Invalid")
          ) {
            errorMessage = "فایل PDF معتبر نیست";
          }
        }
        setError(errorMessage);
        setLoading(false);
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
      if (loadingTask) {
        loadingTask.destroy?.();
      }
    };
  }, [url]);

  // Render PDF page
  const renderPage = useCallback(
    async (pageNum: number, scaleValue: number) => {
      if (!pdf || !canvasRef.current) return;

      try {
        setRendering(true);

        // Cancel previous render task
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }

        const pageObj = await pdf.getPage(pageNum);
        const viewport = pageObj.getViewport({ scale: scaleValue });

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Could not get canvas context");
        }

        // Set canvas dimensions
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Render page
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = pageObj.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        renderTaskRef.current = null;
        setRendering(false);
      } catch (err: any) {
        console.error("PDF rendering error:", err);
        if (err?.name !== "RenderingCancelled") {
          setError("خطا در نمایش صفحه PDF");
          setRendering(false);
        }
      }
    },
    [pdf]
  );

  // Render page when pdf, page, or scale changes
  useEffect(() => {
    if (pdf && page > 0) {
      renderPage(page, scale);
    }
  }, [pdf, page, scale, renderPage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          setPage((p) => Math.max(1, p - 1));
          break;
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          setPage((p) => Math.min(numPages, p + 1));
          break;
        case "+":
        case "=":
          e.preventDefault();
          setScale((s) => Math.min(3, s + 0.2));
          break;
        case "-":
          e.preventDefault();
          setScale((s) => Math.max(0.5, s - 0.2));
          break;
        case "0":
          e.preventDefault();
          setScale(1.2);
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [numPages, onClose]);

  const handleZoomIn = () => {
    setScale((s) => Math.min(3, s + 0.2));
  };

  const handleZoomOut = () => {
    setScale((s) => Math.max(0.5, s - 0.2));
  };

  const handleZoomFit = () => {
    if (!containerRef.current || !canvasRef.current) return;
    const container = containerRef.current;
    const containerWidth = container.clientWidth - 32;
    const containerHeight = container.clientHeight - 32;

    if (pdf && page > 0) {
      pdf
        .getPage(page)
        .then((pageObj: any) => {
          const viewport = pageObj.getViewport({ scale: 1 });
          const scaleX = containerWidth / viewport.width;
          const scaleY = containerHeight / viewport.height;
          const newScale = Math.min(scaleX, scaleY, 2);
          setScale(newScale);
        })
        .catch(console.error);
    }
  };

  const handlePrevPage = () => {
    setPage((p) => Math.max(1, p - 1));
  };

  const handleNextPage = () => {
    setPage((p) => Math.min(numPages, p + 1));
  };

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= numPages) {
      setPage(value);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white mx-auto mb-4"></div>
          <p className="text-lg font-semibold mb-2">در حال بارگذاری PDF...</p>
          <p className="text-sm text-gray-300">لطفاً صبر کنید</p>
        </div>
      </div>
    );
  }

  // Error state
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
            <a
              href={url}
              download
              className="btn btn-outline text-white border-white hover:bg-white hover:text-black"
            >
              دانلود فایل
            </a>
            <button onClick={onClose} className="btn btn-primary">
              بستن
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main viewer
  return (
    <div className="fixed inset-0 z-[10000] bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 text-white border-b border-white/10 bg-black/50">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={page <= 1}
            className="btn btn-sm btn-ghost text-white disabled:opacity-30"
            title="صفحه قبلی (←)"
          >
            <DIcon icon="fa-chevron-right" />
          </button>
          <div className="flex items-center gap-2 px-3">
            <input
              type="number"
              min={1}
              max={numPages}
              value={page}
              onChange={handlePageInput}
              className="w-16 px-2 py-1 text-center bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-primary"
            />
            <span className="text-sm text-gray-300">از {numPages}</span>
          </div>
          <button
            onClick={handleNextPage}
            disabled={page >= numPages}
            className="btn btn-sm btn-ghost text-white disabled:opacity-30"
            title="صفحه بعدی (→)"
          >
            <DIcon icon="fa-chevron-left" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="btn btn-sm btn-ghost text-white"
            title="کوچک‌نمایی (-)"
            disabled={scale <= 0.5}
          >
            <DIcon icon="fa-magnifying-glass-minus" />
          </button>
          <span className="text-sm text-gray-300 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="btn btn-sm btn-ghost text-white"
            title="بزرگ‌نمایی (+)"
            disabled={scale >= 3}
          >
            <DIcon icon="fa-magnifying-glass-plus" />
          </button>
          <button
            onClick={handleZoomFit}
            className="btn btn-sm btn-ghost text-white"
            title="تناسب با صفحه"
          >
            <DIcon icon="fa-arrows-to-dot" />
          </button>
          <div className="w-px h-6 bg-white/20 mx-1"></div>
          <a
            href={url}
            download
            className="btn btn-sm btn-ghost text-white"
            title="دانلود"
          >
            <DIcon icon="fa-download" />
          </a>
          <button
            onClick={onClose}
            className="btn btn-sm btn-ghost text-white hover:bg-red-500/20"
            title="بستن (Esc)"
          >
            <DIcon icon="fa-xmark" />
          </button>
        </div>
      </div>

      {/* Canvas container */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-auto flex items-center justify-center p-4"
      >
        {rendering && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white"></div>
          </div>
        )}
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="shadow-2xl bg-white rounded-lg"
            style={{
              maxWidth: "100%",
              height: "auto",
              display: "block",
            }}
          />
        </div>
      </div>

      {/* Footer navigation (mobile) */}
      <div className="md:hidden flex items-center justify-center gap-3 px-4 py-3 border-t border-white/10 bg-black/50">
        <button
          onClick={handlePrevPage}
          disabled={page <= 1}
          className="btn btn-sm btn-primary disabled:opacity-30"
        >
          <DIcon icon="fa-chevron-right" />
          قبلی
        </button>
        <span className="text-white text-sm">
          {page} / {numPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={page >= numPages}
          className="btn btn-sm btn-primary disabled:opacity-30"
        >
          بعدی
          <DIcon icon="fa-chevron-left" />
        </button>
      </div>
    </div>
  );
}
