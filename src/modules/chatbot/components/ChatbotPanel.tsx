"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import clsx from "clsx";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useChatbot } from "../hooks/useChatbot";
import { ChatMessage } from "../types";
import { ThinkingLog } from "../types/workflow";
import ChatHistorySidebar from "./ChatHistorySidebar";
import ThinkingPanel from "./ThinkingPanel";

const quickCommands: Array<{ label: string; hint: string }> = [
  {
    label: "جستجوی کاربر",
    hint: "کاربر علی را پیدا کن",
  },
  {
    label: "لیست کاربران",
    hint: "تمام کاربران را نشان بده",
  },
  {
    label: "مشاهده کاربر",
    hint: "اطلاعات کاربر علی را بده",
  },
  {
    label: "ایجاد کاربر جدید",
    hint: "کاربر جدیدی با نام علی و شماره 09123456789 بساز",
  },
  {
    label: "ویرایش کاربر",
    hint: "شماره موبایل کاربر علی را به 09987654321 تغییر بده",
  },
  { label: "حذف کاربر", hint: "کاربر علی را حذف کن" },
  { label: "جستجوی برچسب", hint: "برچسب VIP را پیدا کن" },
  { label: "لیست برچسب‌ها", hint: "تمام برچسب‌ها را نشان بده" },
  { label: "مشاهده برچسب", hint: "اطلاعات برچسب VIP را بده" },
  { label: "ایجاد برچسب", hint: "برچسب جدید با نام VIP و رنگ قرمز بساز" },
  { label: "ویرایش برچسب", hint: "رنگ برچسب VIP را به آبی تغییر بده" },
  { label: "حذف برچسب", hint: "برچسب VIP را حذف کن" },
  { label: "جستجوی گروه", hint: "گروه مدیران را پیدا کن" },
  { label: "لیست گروه‌ها", hint: "تمام گروه‌ها را نشان بده" },
  { label: "مشاهده گروه", hint: "اطلاعات گروه مدیران را بده" },
  { label: "ایجاد گروه", hint: "گروه جدید با نام مدیران بساز" },
  { label: "ویرایش گروه", hint: "توضیحات گروه مدیران را تغییر بده" },
  { label: "حذف گروه", hint: "گروه مدیران را حذف کن" },
];

function MessageBubble({
  message,
  onQuickReply,
}: {
  message: ChatMessage;
  onQuickReply?: (value: string) => void;
}) {
  const isUser = message.role === "user";

  // رنگ‌های پیش‌فرض
  const colorMap: Record<string, string> = {
    primary: "bg-primary",
    green: "bg-green-500",
    blue: "bg-blue-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
  };

  return (
    <div
      className={clsx("mb-3 flex flex-col", {
        "items-end": isUser,
        "items-start": !isUser,
      })}
    >
      <div
        className={clsx(
          "max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-6 shadow",
          {
            "bg-primary text-white": isUser,
            "bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-100":
              !isUser,
          }
        )}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>

      {/* Quick Reply Buttons - فقط برای پیام‌های chatbot */}
      {!isUser &&
        message.quickReplies &&
        message.quickReplies.length > 0 &&
        (() => {
          console.log("[MessageBubble] Rendering quickReplies:", {
            count: message.quickReplies!.length,
            quickReplies: message.quickReplies,
          });
          return (
            <div className="mt-2 flex flex-wrap gap-2 max-w-[80%]">
              {message.quickReplies!.map((reply, index) => {
                const bgColor = reply.color
                  ? colorMap[reply.color] || `bg-[${reply.color}]`
                  : "bg-slate-200 dark:bg-slate-700";

                return (
                  <button
                    key={index}
                    onClick={() => {
                      console.log(
                        "[MessageBubble] Quick reply clicked:",
                        reply.value
                      );
                      onQuickReply?.(reply.value);
                    }}
                    className={clsx(
                      "rounded-full px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 transition hover:opacity-80",
                      bgColor
                    )}
                    style={
                      reply.color && !colorMap[reply.color]
                        ? { backgroundColor: reply.color }
                        : undefined
                    }
                  >
                    {reply.label}
                  </button>
                );
              })}
            </div>
          );
        })()}
    </div>
  );
}

export default function ChatbotPanel() {
  const {
    messages,
    loading,
    error,
    sendMessage,
    loadHistory,
    startNewChat,
    sessions,
    loadingSessions,
    sessionId,
    getAllSessions,
  } = useChatbot();
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [thinkingLogs, setThinkingLogs] = useState<ThinkingLog[]>([]);
  const [showThinking, setShowThinking] = useState(false);

  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sortedMessages]);

  const handleSend = async (e?: FormEvent, messageToSend?: string) => {
    e?.preventDefault();
    const message = messageToSend || draft;
    if (!message.trim() || loading) return;

    // پاک کردن input بلافاصله
    setDraft("");

    // ارسال پیام
    await sendMessage(message);

    // Focus بعد از ارسال
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    // Refresh sessions list after sending message - با تاخیر بیشتر برای اطمینان از ذخیره شدن
    setTimeout(() => {
      console.log(
        "[ChatbotPanel] Refreshing sessions list after handleSend..."
      );
      getAllSessions();
    }, 3000);
  };

  const handleSelectSession = async (targetSessionId: number) => {
    await loadHistory(targetSessionId);
  };

  const handleNewChat = () => {
    startNewChat();
  };

  const handleQuickCommand = (hint: string) => {
    setDraft(hint);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  return (
    <div className="flex h-full gap-0 rounded-2xl border bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 overflow-hidden">
      {/* Sidebar */}
      {showSidebar && (
        <div className="hidden md:block h-full">
          <ChatHistorySidebar
            sessions={sessions}
            currentSessionId={sessionId}
            loading={loadingSessions}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
          />
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="md:hidden rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <DIcon icon="fa-bars" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                دستیار مدیریت کاربران
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                کاربران، برچسب‌ها و گروه‌ها را با گفتگو مدیریت کنید.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {thinkingLogs.length > 0 && (
              <button
                onClick={() => setShowThinking(!showThinking)}
                className="flex items-center gap-2 rounded-lg border border-primary/30 px-3 py-1.5 text-xs text-primary transition hover:bg-primary/10"
                title={showThinking ? "پنهان کردن تفکر" : "نمایش تفکر"}
              >
                <DIcon icon={showThinking ? "fa-eye-slash" : "fa-brain"} />
                <span>تفکر ({thinkingLogs.length})</span>
              </button>
            )}
            {sessionId && (
              <button
                onClick={handleNewChat}
                className="hidden md:flex items-center gap-2 rounded-lg border border-primary/30 px-3 py-1.5 text-xs text-primary transition hover:bg-primary/10"
                title="گفتگوی جدید"
              >
                <DIcon icon="fa-plus" />
                <span>جدید</span>
              </button>
            )}
            <DIcon icon="fa-robot" className="text-2xl text-primary" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickCommands.map((item, index) => (
            <button
              key={index}
              onClick={() => handleQuickCommand(item.hint)}
              className="rounded-full border border-dashed border-primary/40 px-3 py-1 text-xs text-primary transition hover:bg-primary/10"
              title={item.hint}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div
          ref={scrollRef}
          className="h-[420px] overflow-y-auto rounded-xl border bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40"
        >
          {sortedMessages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
              <DIcon icon="fa-comments" className="mb-2 text-3xl" />
              <p>برای شروع می‌توانید روی یکی از دکمه‌های بالا کلیک کنید.</p>
              <p className="mt-2 text-xs">
                یا به صورت طبیعی بنویسید مثلا: &quot;کاربر جدیدی با نام احمد
                بساز&quot;
              </p>
            </div>
          )}

          {sortedMessages.map((message) => {
            // Debug: Log message with quickReplies
            if (message.quickReplies && message.quickReplies.length > 0) {
              console.log("[ChatbotPanel] Message with quickReplies:", {
                messageId: message.id,
                quickRepliesCount: message.quickReplies.length,
                quickReplies: message.quickReplies,
              });
            }
            return (
              <MessageBubble
                key={message.id}
                message={message}
                onQuickReply={async (value) => {
                  // ارسال مستقیم بدون نمایش در input
                  await sendMessage(value);
                  setTimeout(() => {
                    inputRef.current?.focus();
                  }, 100);
                }}
              />
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              در حال پردازش...
            </div>
          )}

          {/* Thinking Panel */}
          {thinkingLogs.length > 0 && showThinking && (
            <ThinkingPanel
              logs={thinkingLogs}
              onClose={() => setShowThinking(false)}
            />
          )}
          {error && (
            <div className="mt-2 rounded-lg bg-red-50 p-2 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="flex flex-col gap-2">
          <div className="relative rounded-2xl border bg-white dark:border-slate-700 dark:bg-slate-900">
            <textarea
              ref={inputRef}
              rows={3}
              className="h-full w-full resize-none rounded-2xl bg-transparent px-4 py-3 pr-14 text-sm outline-none placeholder:text-gray-400"
              value={draft}
              placeholder="مثلا: کاربر جدیدی با نام علی و شماره 09123456789 بساز"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !draft.trim()}
              className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:opacity-50"
              title="ارسال پیام"
            >
              <DIcon icon="fa-paper-plane" className="text-sm" />
            </button>
          </div>

          <div className="flex items-center justify-start text-xs text-gray-400">
            <span>Enter = ارسال • Shift + Enter = خط جدید</span>
          </div>
        </form>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setShowSidebar(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <ChatHistorySidebar
              sessions={sessions}
              currentSessionId={sessionId}
              loading={loadingSessions}
              onSelectSession={(id) => {
                handleSelectSession(id);
                setShowSidebar(false);
              }}
              onNewChat={() => {
                handleNewChat();
                setShowSidebar(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
