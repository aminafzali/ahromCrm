"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

interface ChatWindowProps {
  room: any | null;
  messages: any[];
  currentUserId?: number;
  onSendMessage: (message: string) => void;
  onReplyMessage?: (message: any) => void;
  onEditMessage?: (message: any) => void;
  onDeleteMessage?: (message: any) => void;
  onTyping?: (isTyping: boolean) => void;
  typingUsers?: string[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => Promise<void> | void;
  skipAutoScroll?: boolean;
  composerValue?: string;
  composerMode?: "reply" | "edit" | null;
  composerPreview?: string;
  onComposerChange?: (v: string) => void;
  onComposerCancel?: () => void;
  autoScrollSignal?: number; // one-time signal to scroll to bottom (room select)
  onNearBottom?: () => void; // callback to mark as read when near bottom
}

export default function ChatWindow({
  room,
  messages = [],
  currentUserId,
  onSendMessage,
  onReplyMessage,
  onEditMessage,
  onDeleteMessage,
  onTyping,
  typingUsers = [],
  loading = false,
  hasMore = false,
  onLoadMore,
  skipAutoScroll = false,
  composerValue,
  composerMode = null,
  composerPreview,
  onComposerChange,
  onComposerCancel,
  autoScrollSignal,
  onNearBottom,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [showLoadOlder, setShowLoadOlder] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const lastNearBottomAtRef = useRef<number>(0);
  const prevMessagesLenRef = useRef<number>(messages.length);
  const isTypingRef = useRef<boolean>(false);

  const getDistanceFromBottom = (): number => {
    const el = listRef.current;
    if (!el) return Number.MAX_SAFE_INTEGER;
    return el.scrollHeight - el.scrollTop - el.clientHeight;
  };

  const isNearBottom = (threshold = 160): boolean => {
    return getDistanceFromBottom() <= threshold;
  };

  const scrollToBottom = () => {
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Only scroll when explicitly signaled (room select) - after render
  useEffect(() => {
    if (!autoScrollSignal) return;
    const id = requestAnimationFrame(() => {
      const id2 = requestAnimationFrame(() => {
        scrollToBottom();
      });
      return () => cancelAnimationFrame(id2);
    });
    return () => cancelAnimationFrame(id);
  }, [autoScrollSignal]);

  // Auto-scroll when new message arrives and user is near bottom, or when it's own message
  useEffect(() => {
    const len = messages.length;
    const appended = len > (prevMessagesLenRef.current || 0);
    if (appended && !skipAutoScroll) {
      const last = messages[len - 1];
      const own =
        last?.senderId && currentUserId && last.senderId === currentUserId;
      if (own || isNearBottom(220)) {
        // two RAFs to ensure layout settled
        const id = requestAnimationFrame(() => {
          const id2 = requestAnimationFrame(() => scrollToBottom());
          return () => cancelAnimationFrame(id2);
        });
        return () => cancelAnimationFrame(id);
      }
    }
    prevMessagesLenRef.current = len;
  }, [messages.length, skipAutoScroll, currentUserId]);

  // Track visibility states for top/bottom buttons and trigger near-bottom callback
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    let ticking = false;
    const updateStates = () => {
      const TOP_THRESHOLD_PX = 60;
      const BOTTOM_THRESHOLD_PX = 140;
      setShowLoadOlder(el.scrollTop <= TOP_THRESHOLD_PX && !!hasMore);
      const distanceFromBottom = getDistanceFromBottom();
      const near = distanceFromBottom <= BOTTOM_THRESHOLD_PX;
      setShowScrollBottom(!near);

      // Prevent read triggers while typing or when auto-scroll is intentionally disabled
      if (near && onNearBottom && !isTypingRef.current && !skipAutoScroll) {
        const now = Date.now();
        if (now - (lastNearBottomAtRef.current || 0) > 3000) {
          lastNearBottomAtRef.current = now;
          onNearBottom();
        }
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateStates();
        ticking = false;
      });
    };

    updateStates();
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [hasMore, messages.length, onNearBottom, skipAutoScroll]);

  // Track typing state from MessageInput to suppress near-bottom triggers
  const handleTyping = (val: boolean) => {
    isTypingRef.current = !!val;
    onTyping?.(val);
  };

  console.log("🪟 [ChatWindow] Rendering with:", {
    roomId: room?.id,
    messagesCount: messages.length,
    currentUserId,
  });

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DIcon icon="fa-comments" classCustom="text-5xl text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            به گفتگوی سازمانی خوش آمدید
          </h3>
          <p className="text-gray-500">
            یک کاربر یا گروه را انتخاب کنید تا گفتگو را شروع کنید
          </p>
        </div>
      </div>
    );
  }

  const roomName = room.title || room.team?.name || "گفتگو";
  const roomType = room.type;
  const isTeamRoom = roomType === "TEAM" || roomType === "GROUP";

  return (
    <div className="flex-1 flex flex-col bg-white h-full relative">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Room Avatar */}
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                isTeamRoom ? "bg-purple-400" : "bg-blue-400"
              }`}
            >
              <DIcon
                icon={isTeamRoom ? "fa-users" : "fa-user"}
                classCustom="text-xl"
              />
            </div>

            {/* Room Info */}
            <div>
              <h3 className="font-bold text-lg">{roomName}</h3>
              <div className="text-sm opacity-90">
                {isTeamRoom ? (
                  <span>{room._count?.members || 0} عضو</span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    آنلاین
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="تماس صوتی"
            >
              <DIcon icon="fa-phone" />
            </button>
            <button
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="تماس تصویری"
            >
              <DIcon icon="fa-video" />
            </button>
            <button
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="تنظیمات"
            >
              <DIcon icon="fa-ellipsis-v" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      >
        {/* Reserve space for sticky load-older to avoid jump when toggling */}
        <div className="sticky top-0 h-0"></div>

        {hasMore && showLoadOlder && (
          <div className="sticky top-0 z-10 flex justify-center">
            <button
              className="mt-1 mb-3 inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-full bg-white/80 backdrop-blur border border-gray-200 shadow hover:bg-white transition"
              onClick={async () => {
                if (!onLoadMore || !listRef.current) return;
                const el = listRef.current;
                const prevHeight = el.scrollHeight;
                const prevTop = el.scrollTop;
                const prevBehavior = (el.style as any).scrollBehavior;
                (el.style as any).scrollBehavior = "auto";
                await onLoadMore();
                // Double RAF to wait for DOM + layout
                requestAnimationFrame(() => {
                  const delta1 = el.scrollHeight - prevHeight;
                  el.scrollTop = prevTop + delta1;
                  requestAnimationFrame(() => {
                    const delta2 = el.scrollHeight - prevHeight;
                    el.scrollTop = prevTop + delta2;
                    (el.style as any).scrollBehavior = prevBehavior || "";
                  });
                });
              }}
              title="نمایش پیام‌های قبلی"
            >
              <DIcon icon="fa-arrow-up" />
              <span>پیام‌های قبلی</span>
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <DIcon
                icon="fa-spinner"
                classCustom="text-4xl text-blue-500 animate-spin mb-3"
              />
              <p className="text-gray-500">در حال بارگذاری پیام‌ها...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="bg-white rounded-full p-6 shadow-lg mb-4">
              <DIcon icon="fa-message" classCustom="text-5xl text-gray-300" />
            </div>
            <p className="text-lg font-medium text-gray-600">
              هنوز پیامی وجود ندارد
            </p>
            <p className="text-sm text-gray-400 mt-1">
              اولین پیام را ارسال کنید و گفتگو را شروع کنید
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message, index) => {
              const isOwnMessage = message.senderId === currentUserId;
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const showAvatar =
                !prevMessage || prevMessage.senderId !== message.senderId;

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwnMessage={isOwnMessage}
                  currentUserId={currentUserId}
                  showAvatar={showAvatar}
                  showTime={true}
                  onReply={onReplyMessage}
                  onEdit={onEditMessage}
                  onDelete={onDeleteMessage}
                />
              );
            })}

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div
                className="flex items-center gap-2 text-gray-500 text-sm px-4 py-2"
                dir="rtl"
              >
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></span>
                </div>
                <span>{typingUsers.join(", ")} در حال نوشتن...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating scroll-to-bottom button (FAB) */}
      {showScrollBottom && (
        <button
          className="absolute left-4 w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 flex items-center justify-center z-30"
          style={{ bottom: 88 }}
          onClick={scrollToBottom}
          title="آخرین پیام"
          aria-label="آخرین پیام"
        >
          <DIcon icon="fa-arrow-down" />
        </button>
      )}

      {/* Message Input */}
      <div className="border-top bg-white shadow-lg">
        <MessageInput
          onSend={onSendMessage}
          onTyping={handleTyping}
          placeholder={`پیام به ${roomName}...`}
          value={composerValue}
          onChangeValue={onComposerChange}
          actionMode={composerMode}
          actionPreview={composerPreview}
          onCancelAction={onComposerCancel}
        />
      </div>
    </div>
  );
}
