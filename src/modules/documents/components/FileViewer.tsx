"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { useEffect, useRef, useState } from "react";

interface FileViewerProps {
  url: string;
  mimeType: string;
  fileName: string;
  onClose: () => void;
}

export default function FileViewer({
  url,
  mimeType,
  fileName,
  onClose,
}: FileViewerProps) {
  const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";

  // Prevent body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Keyboard shortcut for close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Determine file type
  const getFileType = () => {
    if (mimeType.includes("text/plain") || fileExtension === "txt") {
      return "txt";
    }
    // Check for DOC (old format) - NOT supported
    if (mimeType.includes("application/msword") || fileExtension === "doc") {
      return "doc"; // DOC files are not supported
    }
    // Check for DOCX (new format) - supported
    if (
      mimeType.includes("wordprocessingml") ||
      mimeType.includes(
        "application/vnd.openxmlformats-officedocument.wordprocessingml"
      ) ||
      fileExtension === "docx"
    ) {
      return "docx";
    }
    if (
      mimeType.includes("spreadsheetml") ||
      mimeType.includes(
        "application/vnd.openxmlformats-officedocument.spreadsheetml"
      ) ||
      fileExtension === "xlsx"
    ) {
      return "xlsx";
    }
    if (mimeType.includes("text/csv") || fileExtension === "csv") {
      return "csv";
    }
    if (mimeType.includes("image/svg+xml") || fileExtension === "svg") {
      return "svg";
    }
    if (
      mimeType.includes("video/") ||
      ["mp4", "webm", "ogg", "mov"].includes(fileExtension)
    ) {
      return "video";
    }
    return "unknown";
  };

  const fileType = getFileType();

  return (
    <div className="fixed inset-0 z-[10000] bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 text-white border-b border-white/10 bg-black/50">
        <div className="flex items-center gap-3">
          <h3
            className="text-lg font-semibold truncate max-w-md"
            title={fileName}
          >
            {fileName}
          </h3>
          <span className="text-xs text-gray-400 px-2 py-1 bg-white/10 rounded">
            {fileType.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={url}
            download={fileName}
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

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {fileType === "txt" && <TxtViewer url={url} />}
        {fileType === "docx" && <DocxViewer url={url} />}
        {fileType === "doc" && (
          <div className="flex items-center justify-center h-full text-white">
            <div className="text-center">
              <DIcon
                icon="fa-exclamation-triangle"
                classCustom="text-6xl mb-4 text-yellow-400"
              />
              <h3 className="text-xl font-semibold mb-2">
                فایل DOC پشتیبانی نمی‌شود
              </h3>
              <p className="mb-6 text-gray-300">
                فقط فایل‌های DOCX قابل نمایش هستند. لطفاً فایل را دانلود کنید.
              </p>
              <a href={url} download={fileName} className="btn btn-primary">
                دانلود فایل
              </a>
            </div>
          </div>
        )}
        {fileType === "xlsx" && <XlsxViewer url={url} />}
        {fileType === "csv" && <CsvViewer url={url} />}
        {fileType === "svg" && <SvgViewer url={url} />}
        {fileType === "video" && <VideoViewer url={url} mimeType={mimeType} />}
        {fileType === "unknown" && (
          <div className="flex items-center justify-center h-full text-white">
            <div className="text-center">
              <DIcon icon="fa-file" classCustom="text-6xl mb-4 text-gray-400" />
              <p className="text-lg mb-2">نوع فایل پشتیبانی نمی‌شود</p>
              <p className="text-sm text-gray-300 mb-4">
                نوع فایل: {mimeType || "نامشخص"}
              </p>
              <a href={url} download={fileName} className="btn btn-primary">
                دانلود فایل
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// TXT Viewer
function TxtViewer({ url }: { url: string }) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadText = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to load file");
        const text = await response.text();
        setContent(text);
        setError(null);
      } catch (err: any) {
        console.error("TXT loading error:", err);
        setError("خطا در بارگذاری فایل متنی");
      } finally {
        setLoading(false);
      }
    };
    loadText();
  }, [url]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white mx-auto mb-4"></div>
          <p>در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <div className="text-center">
          <DIcon
            icon="fa-exclamation-triangle"
            classCustom="text-4xl mb-4 text-red-400"
          />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full">
      <pre className="bg-white rounded-lg p-6 text-sm font-mono overflow-auto h-full text-gray-900 whitespace-pre-wrap break-words">
        {content}
      </pre>
    </div>
  );
}

// DOCX Viewer - Using docx-preview
function DocxViewer({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const styleContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadDocx = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the DOCX file
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to load DOCX file");
        const arrayBuffer = await response.arrayBuffer();

        if (!mounted || !containerRef.current) return;

        // Clear previous content
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }
        if (styleContainerRef.current) {
          styleContainerRef.current.innerHTML = "";
        }

        // Dynamic import for docx-preview
        const docx = await import("docx-preview");

        // Render the document
        await docx.renderAsync(
          arrayBuffer,
          containerRef.current,
          styleContainerRef.current,
          {
            className: "docx-wrapper",
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false,
            ignoreFonts: false,
            breakPages: true,
            ignoreLastRenderedPageBreak: false,
          }
        );

        if (mounted) {
          setLoading(false);
        }
      } catch (err: any) {
        console.error("DOCX loading error:", err);
        if (mounted) {
          setError("خطا در بارگذاری فایل DOCX");
          setLoading(false);
        }
      }
    };

    loadDocx();

    return () => {
      mounted = false;
    };
  }, [url]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white mx-auto mb-4"></div>
          <p>در حال بارگذاری فایل DOCX...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <div className="text-center">
          <DIcon
            icon="fa-exclamation-triangle"
            classCustom="text-4xl mb-4 text-red-400"
          />
          <p className="mb-4">{error}</p>
          <a href={url} download className="btn btn-primary">
            دانلود فایل
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-auto bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto min-h-[600px]">
        <div ref={styleContainerRef}></div>
        <div ref={containerRef} className="docx-wrapper"></div>
      </div>
    </div>
  );
}

// XLSX Viewer
function XlsxViewer({ url }: { url: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheets, setSheets] = useState<Array<{ name: string; data: any[][] }>>(
    []
  );
  const [activeSheet, setActiveSheet] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadXlsx = async () => {
      try {
        setLoading(true);
        setError(null);

        // Dynamic import for xlsx

        const XLSX = await import("xlsx");

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to load XLSX file");
        const arrayBuffer = await response.arrayBuffer();

        if (!mounted) return;

        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetData: Array<{ name: string; data: any[][] }> = [];

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          });
          sheetData.push({
            name: sheetName,
            data: jsonData as any[][],
          });
        });

        setSheets(sheetData);
        setLoading(false);
      } catch (err: any) {
        console.error("XLSX loading error:", err);
        setError("خطا در بارگذاری فایل XLSX");
        setLoading(false);
      }
    };

    loadXlsx();

    return () => {
      mounted = false;
    };
  }, [url]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white mx-auto mb-4"></div>
          <p>در حال بارگذاری XLSX...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <div className="text-center">
          <DIcon
            icon="fa-exclamation-triangle"
            classCustom="text-4xl mb-4 text-red-400"
          />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (sheets.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <p>هیچ داده‌ای یافت نشد</p>
      </div>
    );
  }

  const currentSheet = sheets[activeSheet]?.data || [];

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Sheet tabs */}
      {sheets.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {sheets.map((sheet, index) => (
            <button
              key={index}
              onClick={() => setActiveSheet(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                activeSheet === index
                  ? "bg-primary text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {sheet.name}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto bg-white rounded-lg shadow-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50 sticky top-0">
            {currentSheet[0] && (
              <tr>
                {currentSheet[0].map((cell, colIndex) => (
                  <th
                    key={colIndex}
                    className="border border-gray-300 px-4 py-2 text-right font-semibold text-gray-700 bg-gray-100"
                  >
                    {String(cell || "")}
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {currentSheet.slice(1).map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {row.map((cell, colIndex) => (
                  <td
                    key={colIndex}
                    className="border border-gray-300 px-4 py-2 text-right text-gray-800"
                  >
                    {String(cell || "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// CSV Viewer
function CsvViewer({ url }: { url: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<string[][]>([]);

  useEffect(() => {
    let mounted = true;

    const loadCsv = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to load CSV file");
        const text = await response.text();

        if (!mounted) return;

        // Simple CSV parser (handles basic cases)
        const lines = text.split("\n").filter((line) => line.trim());
        const parsed: string[][] = [];

        for (const line of lines) {
          const row: string[] = [];
          let current = "";
          let inQuotes = false;

          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
              row.push(current.trim());
              current = "";
            } else {
              current += char;
            }
          }
          row.push(current.trim());
          parsed.push(row);
        }

        setData(parsed);
        setLoading(false);
      } catch (err: any) {
        console.error("CSV loading error:", err);
        setError("خطا در بارگذاری فایل CSV");
        setLoading(false);
      }
    };

    loadCsv();

    return () => {
      mounted = false;
    };
  }, [url]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white mx-auto mb-4"></div>
          <p>در حال بارگذاری CSV...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <div className="text-center">
          <DIcon
            icon="fa-exclamation-triangle"
            classCustom="text-4xl mb-4 text-red-400"
          />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <p>هیچ داده‌ای یافت نشد</p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50 sticky top-0">
            {data[0] && (
              <tr>
                {data[0].map((cell, colIndex) => (
                  <th
                    key={colIndex}
                    className="border border-gray-300 px-4 py-2 text-right font-semibold text-gray-700 bg-gray-100"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {data.slice(1).map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {row.map((cell, colIndex) => (
                  <td
                    key={colIndex}
                    className="border border-gray-300 px-4 py-2 text-right text-gray-800"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// SVG Viewer
function SvgViewer({ url }: { url: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    const loadSvg = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to load SVG file");
        const text = await response.text();

        if (!mounted) return;

        setSvgContent(text);
        setLoading(false);
      } catch (err: any) {
        console.error("SVG loading error:", err);
        setError("خطا در بارگذاری فایل SVG");
        setLoading(false);
      }
    };

    loadSvg();

    return () => {
      mounted = false;
    };
  }, [url]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white mx-auto mb-4"></div>
          <p>در حال بارگذاری SVG...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <div className="text-center">
          <DIcon
            icon="fa-exclamation-triangle"
            classCustom="text-4xl mb-4 text-red-400"
          />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-auto flex items-center justify-center bg-gray-50">
      <div
        className="max-w-full max-h-full"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
}

// Video Viewer
function VideoViewer({ url, mimeType }: { url: string; mimeType: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="p-6 h-full flex items-center justify-center bg-black">
      <div className="w-full max-w-6xl">
        <video
          ref={videoRef}
          src={url}
          controls
          className="w-full h-auto max-h-[85vh] rounded-lg"
          onLoadedData={() => setLoading(false)}
          onError={() => {
            setError("خطا در بارگذاری ویدئو");
            setLoading(false);
          }}
        >
          مرورگر شما از پخش ویدئو پشتیبانی نمی‌کند.
        </video>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white mx-auto mb-4"></div>
              <p>در حال بارگذاری ویدئو...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <DIcon
                icon="fa-exclamation-triangle"
                classCustom="text-4xl mb-4 text-red-400"
              />
              <p>{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
