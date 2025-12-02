"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import clsx from "clsx";

interface ChatSession {
  id: number;
  status: string;
  title: string | null;
  lastMessage: string | null;
  lastMessageRole: string | null;
  lastMessageAt: Date | string;
  messageCount: number;
  createdAt: Date | string;
  currentIntent: string | null;
}

interface ChatHistorySidebarProps {
  sessions: ChatSession[];
  currentSessionId?: number;
  loading?: boolean;
  onSelectSession: (sessionId: number) => void;
  onNewChat: () => void;
}

export default function ChatHistorySidebar({
  sessions,
  currentSessionId,
  loading = false,
  onSelectSession,
  onNewChat,
}: ChatHistorySidebarProps) {
  const formatDate = (date: Date | string) => {
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "همین الان";
      if (diffMins < 60) return `${diffMins} دقیقه پیش`;
      if (diffHours < 24) return `${diffHours} ساعت پیش`;
      if (diffDays < 7) return `${diffDays} روز پیش`;

      // برای تاریخ‌های قدیمی‌تر، از toLocaleDateString استفاده می‌کنیم
      return d.toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  const truncateMessage = (message: string | null, maxLength: number = 40) => {
    if (!message) return "بدون پیام";
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  return (
    <div className="flex h-full w-80 flex-col border-r border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 border-b border-slate-200 p-4 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            تاریخچه گفتگوها
          </h2>
          <DIcon
            icon="fa-history"
            className="text-slate-600 dark:text-slate-400"
          />
        </div>
        <button
          onClick={onNewChat}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 flex items-center justify-center gap-2"
        >
          <DIcon icon="fa-plus" />
          گفتگوی جدید
        </button>
      </div>

      {/* Sessions List - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {!loading && sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 dark:text-gray-400">
            <DIcon icon="fa-comments" className="mb-2 text-3xl" />
            <p className="text-sm">هنوز گفتگویی ثبت نشده است</p>
            <p className="mt-1 text-xs">
              برای شروع گفتگوی جدید، روی دکمه &quot;گفتگوی جدید&quot; کلیک کنید
            </p>
          </div>
        )}

        {!loading &&
          sessions.length > 0 &&
          (() => {
            // گروه‌بندی sessions بر اساس title
            const groupedByTitle: Record<string, typeof sessions> = {};
            const sessionsWithoutTitle: typeof sessions = [];

            sessions.forEach((session) => {
              if (session.title) {
                if (!groupedByTitle[session.title]) {
                  groupedByTitle[session.title] = [];
                }
                groupedByTitle[session.title].push(session);
              } else {
                sessionsWithoutTitle.push(session);
              }
            });

            return (
              <div className="p-2">
                {/* گفتگوهای با title (گروه‌بندی شده) */}
                {Object.keys(groupedByTitle).map((title) => {
                  const titleSessions = groupedByTitle[title];
                  return (
                    <div key={title} className="mb-4">
                      {/* Header گروه */}
                      <div className="mb-2 px-2">
                        <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                          {title} ({titleSessions.length})
                        </h3>
                      </div>
                      {/* Sessions این گروه */}
                      {titleSessions.map((session) => {
                        const isActive = session.id === currentSessionId;
                        return (
                          <button
                            key={session.id}
                            onClick={() => onSelectSession(session.id)}
                            className={clsx(
                              "mb-2 w-full rounded-lg p-3 text-right transition-all",
                              {
                                "bg-primary text-white shadow-md": isActive,
                                "bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600":
                                  !isActive,
                              }
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <DIcon
                                    icon={
                                      session.lastMessageRole === "USER"
                                        ? "fa-user"
                                        : "fa-robot"
                                    }
                                    className={clsx("text-xs", {
                                      "text-white/80": isActive,
                                      "text-slate-500 dark:text-slate-400":
                                        !isActive,
                                    })}
                                  />
                                  <span
                                    className={clsx("text-xs font-medium", {
                                      "text-white/80": isActive,
                                      "text-slate-500 dark:text-slate-400":
                                        !isActive,
                                    })}
                                  >
                                    {formatDate(session.lastMessageAt)}
                                  </span>
                                </div>
                                <p
                                  className={clsx(
                                    "text-sm line-clamp-2 break-words",
                                    {
                                      "text-white/90": isActive,
                                      "text-slate-600 dark:text-slate-300":
                                        !isActive,
                                    }
                                  )}
                                >
                                  {truncateMessage(session.lastMessage)}
                                </p>
                                <div
                                  className={clsx(
                                    "mt-1 flex items-center gap-2 text-xs",
                                    {
                                      "text-white/70": isActive,
                                      "text-slate-500 dark:text-slate-400":
                                        !isActive,
                                    }
                                  )}
                                >
                                  <span>{session.messageCount} پیام</span>
                                  {session.status !== "ACTIVE" && (
                                    <span
                                      className={clsx(
                                        "px-2 py-0.5 rounded text-xs",
                                        {
                                          "bg-white/20": isActive,
                                          "bg-slate-200 dark:bg-slate-600":
                                            !isActive,
                                        }
                                      )}
                                    >
                                      {session.status === "COMPLETED"
                                        ? "تمام شده"
                                        : "لغو شده"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}

                {/* گفتگوهای بدون title */}
                {sessionsWithoutTitle.length > 0 && (
                  <div className="mb-4">
                    <div className="mb-2 px-2">
                      <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        گفتگوهای بدون عنوان ({sessionsWithoutTitle.length})
                      </h3>
                    </div>
                    {sessionsWithoutTitle.map((session) => {
                      const isActive = session.id === currentSessionId;
                      return (
                        <button
                          key={session.id}
                          onClick={() => onSelectSession(session.id)}
                          className={clsx(
                            "mb-2 w-full rounded-lg p-3 text-right transition-all",
                            {
                              "bg-primary text-white shadow-md": isActive,
                              "bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600":
                                !isActive,
                            }
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <DIcon
                                  icon={
                                    session.lastMessageRole === "USER"
                                      ? "fa-user"
                                      : "fa-robot"
                                  }
                                  className={clsx("text-xs", {
                                    "text-white/80": isActive,
                                    "text-slate-500 dark:text-slate-400":
                                      !isActive,
                                  })}
                                />
                                <span
                                  className={clsx("text-xs font-medium", {
                                    "text-white/80": isActive,
                                    "text-slate-500 dark:text-slate-400":
                                      !isActive,
                                  })}
                                >
                                  {formatDate(session.lastMessageAt)}
                                </span>
                              </div>
                              <p
                                className={clsx(
                                  "text-sm line-clamp-2 break-words",
                                  {
                                    "text-white/90": isActive,
                                    "text-slate-600 dark:text-slate-300":
                                      !isActive,
                                  }
                                )}
                              >
                                {truncateMessage(session.lastMessage)}
                              </p>
                              <div
                                className={clsx(
                                  "mt-1 flex items-center gap-2 text-xs",
                                  {
                                    "text-white/70": isActive,
                                    "text-slate-500 dark:text-slate-400":
                                      !isActive,
                                  }
                                )}
                              >
                                <span>{session.messageCount} پیام</span>
                                {session.status !== "ACTIVE" && (
                                  <span
                                    className={clsx(
                                      "px-2 py-0.5 rounded text-xs",
                                      {
                                        "bg-white/20": isActive,
                                        "bg-slate-200 dark:bg-slate-600":
                                          !isActive,
                                      }
                                    )}
                                  >
                                    {session.status === "COMPLETED"
                                      ? "تمام شده"
                                      : "لغو شده"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
      </div>
    </div>
  );
}
