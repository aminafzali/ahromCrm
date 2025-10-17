"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { useEffect, useRef, useState } from "react";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";
import TicketMessageBubble from "./TicketMessageBubble";
import TicketMessageInput from "./TicketMessageInput";

interface TicketChatWindowProps {
  ticket: any | null;
  messages: any[];
  currentUserId?: number;
  isAgent?: boolean;
  onSendMessage: (message: string, isInternal?: boolean) => void;
  onTyping?: (isTyping: boolean) => void;
  typingUsers?: string[];
  loading?: boolean;
  onChangeStatus?: (status: string) => void;
  onAssign?: () => void;
  hasMore?: boolean;
  onLoadMore?: () => Promise<void> | void;
  autoScrollSignal?: number;
}

export default function TicketChatWindow({
  ticket,
  messages = [],
  currentUserId,
  isAgent = true,
  onSendMessage,
  onTyping,
  typingUsers = [],
  loading = false,
  onChangeStatus,
  onAssign,
  hasMore = false,
  onLoadMore,
  autoScrollSignal,
}: TicketChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [composerValue, setComposerValue] = useState("");
  const [composerMode, setComposerMode] = useState<"reply" | "edit" | null>(
    null
  );
  const [composerPreview, setComposerPreview] = useState<string | undefined>(
    undefined
  );
  const [editMessageId, setEditMessageId] = useState<number | undefined>(
    undefined
  );
  const [showLoadOlder, setShowLoadOlder] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Scroll to bottom when signaled (on initial open)
  useEffect(() => {
    if (autoScrollSignal) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [autoScrollSignal]);

  // Auto scroll to bottom on new messages (agent/customer sending)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Track scroll to toggle top/bottom helpers
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const handleScroll = () => {
      const TOP_THRESHOLD = 60;
      const BOTTOM_THRESHOLD = 120;
      setShowLoadOlder(el.scrollTop <= TOP_THRESHOLD && !!hasMore);
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBottom(distanceFromBottom > BOTTOM_THRESHOLD);
    };
    handleScroll();
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [hasMore, messages.length]);

  // No ticket selected
  if (!ticket) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DIcon icon="fa-headset" classCustom="text-5xl text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            سیستم پشتیبانی مشتریان
          </h3>
          <p className="text-gray-500">
            یک تیکت را انتخاب کنید تا گفتگو را شروع کنید
          </p>
        </div>
      </div>
    );
  }

  const customerName = ticket.workspaceUser
    ? ticket.workspaceUser.displayName
    : ticket.guestUser
    ? ticket.guestUser.name
    : "کاربر ناشناس";

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm opacity-90">#{ticket.ticketNumber}</span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h3 className="font-bold text-lg">{ticket.subject}</h3>
            <div className="text-sm opacity-90 mt-1">
              <DIcon icon="fa-user" classCustom="ml-1" cdi={false} />
              {customerName}
              {ticket.assignedTo && (
                <span className="mr-3">
                  <DIcon icon="fa-user-tie" classCustom="ml-1" cdi={false} />
                  کارشناس: {ticket.assignedTo.displayName}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          {isAgent && (
            <div className="flex items-center gap-2">
              {onChangeStatus && (
                <button
                  onClick={() => onChangeStatus(ticket.status)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="تغییر وضعیت"
                >
                  <DIcon icon="fa-tasks" />
                </button>
              )}
              {onAssign && (
                <button
                  onClick={onAssign}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="تخصیص تیکت"
                >
                  <DIcon icon="fa-user-plus" />
                </button>
              )}
              <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <DIcon icon="fa-ellipsis-v" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white"
        ref={listRef}
      >
        {hasMore && showLoadOlder && (
          <div className="sticky top-0 z-10 flex justify-center">
            <button
              className="mt-1 mb-3 inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-full bg-white/80 backdrop-blur border border-gray-200 shadow hover:bg-white transition"
              onClick={async () => {
                if (!onLoadMore || !listRef.current) return;
                const el = listRef.current;
                const prevHeight = el.scrollHeight;
                const prevTop = el.scrollTop;
                await onLoadMore();
                const newHeight = el.scrollHeight;
                el.scrollTop = prevTop + (newHeight - prevHeight);
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
            <DIcon
              icon="fa-spinner"
              classCustom="text-4xl text-blue-500 animate-spin"
            />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <DIcon icon="fa-message" classCustom="text-5xl mb-3" />
            <p>هنوز پیامی وجود ندارد</p>
          </div>
        ) : (
          messages.map((message, index) => {
            // For admin interface, messages from admin are "own" messages
            const isOwnMessage = isAgent
              ? message.supportAgentId === currentUserId ||
                message.workspaceUserId === currentUserId
              : message.workspaceUserId === currentUserId ||
                message.guestUserId === currentUserId;
            const showAvatar =
              index === 0 ||
              messages[index - 1]?.supportAgentId !== message.supportAgentId ||
              messages[index - 1]?.workspaceUserId !== message.workspaceUserId;

            return (
              <TicketMessageBubble
                key={message.id || index}
                message={message}
                isOwnMessage={isOwnMessage}
                isAgent={isAgent}
                showAvatar={showAvatar}
                showTime={true}
                onReply={() => {
                  setComposerMode("reply");
                  setComposerPreview(message.body?.slice(0, 60));
                }}
                onEdit={() => {
                  setComposerMode("edit");
                  setComposerValue(message.body || "");
                  setComposerPreview(undefined);
                  setEditMessageId(message.id);
                }}
                onDelete={() => {
                  const ev = new CustomEvent("support-chat:delete-request", {
                    detail: { messageId: message.id },
                  });
                  window.dispatchEvent(ev);
                }}
              />
            );
          })
        )}

        <div ref={messagesEndRef} />

        {showScrollBottom && (
          <button
            className="absolute bottom-4 left-4 w-10 h-10 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 flex items-center justify-center z-20"
            onClick={() =>
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
            }
            title="آخرین پیام"
            aria-label="آخرین پیام"
          >
            <DIcon icon="fa-arrow-down" classCustom="text-white" />
          </button>
        )}
      </div>

      {/* Message Input */}
      <TicketMessageInput
        onSend={(msg) => {
          if (composerMode === "edit" && editMessageId) {
            const ev = new CustomEvent("support-chat:edit-request", {
              detail: { messageId: editMessageId, text: msg },
            });
            window.dispatchEvent(ev);
            setComposerMode(null);
            setComposerValue("");
            setEditMessageId(undefined);
            return;
          }
          onSendMessage(msg);
          setComposerMode(null);
          setComposerPreview(undefined);
          setComposerValue("");
        }}
        onTyping={onTyping}
        placeholder={`پاسخ به ${customerName}...`}
        value={composerValue}
        onChangeValue={setComposerValue}
        actionMode={composerMode}
        actionPreview={composerPreview}
        onCancelAction={() => {
          setComposerMode(null);
          setComposerPreview(undefined);
          setComposerValue("");
          setEditMessageId(undefined);
        }}
      />
    </div>
  );
}
