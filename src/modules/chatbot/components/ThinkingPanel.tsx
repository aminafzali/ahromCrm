// Component برای نمایش thinking process
"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import clsx from "clsx";
import { ThinkingLog } from "../types/workflow";

interface ThinkingPanelProps {
  logs: ThinkingLog[];
  isVisible?: boolean;
  onClose?: () => void;
}

export default function ThinkingPanel({
  logs,
  isVisible = true,
  onClose,
}: ThinkingPanelProps) {
  if (!isVisible || logs.length === 0) {
    return null;
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);

    if (seconds < 1) return "همین الان";
    if (seconds < 60) return `${seconds} ثانیه پیش`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} دقیقه پیش`;
    return new Date(date).toLocaleTimeString("fa-IR");
  };

  return (
    <div className="border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DIcon icon="fa-brain" className="text-primary" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            فرآیند تفکر ({logs.length})
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <DIcon icon="fa-times" />
          </button>
        )}
      </div>

      <div className="max-h-60 space-y-2 overflow-y-auto">
        {logs.map((log, index) => (
          <div
            key={index}
            className={clsx("rounded-lg border p-3 text-xs transition-all", {
              "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20":
                log.step.includes("start"),
              "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20":
                log.step.includes("complete"),
              "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20":
                log.step.includes("error"),
              "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800":
                !log.step.includes("start") &&
                !log.step.includes("complete") &&
                !log.step.includes("error"),
            })}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {log.action}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                {formatTimestamp(log.timestamp)}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">{log.thought}</p>
            {log.data && (
              <details className="mt-2">
                <summary className="cursor-pointer text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                  جزئیات
                </summary>
                <pre className="mt-2 max-h-40 overflow-auto rounded bg-slate-100 p-2 text-xs dark:bg-slate-900">
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
