"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { format } from "date-fns-jalali";
import { useState } from "react";
import { SupportMessageWithRelations } from "../types";

interface TicketMessageBubbleProps {
  message: SupportMessageWithRelations | any;
  isOwnMessage: boolean;
  isAgent?: boolean;
  showAvatar?: boolean;
  showTime?: boolean;
  onReply?: (message: any) => void;
  onEdit?: (message: any) => void;
  onDelete?: (message: any) => void;
}

export default function TicketMessageBubble({
  message,
  isOwnMessage,
  isAgent = true,
  showAvatar = true,
  showTime = true,
  onReply,
  onEdit,
  onDelete,
}: TicketMessageBubbleProps) {
  // Determine sender display name based on message relations in Support Chat
  const senderName = message.supportAgent
    ? message.supportAgent.displayName
    : message.workspaceUser
    ? message.workspaceUser.displayName
    : message.guestUser
    ? message.guestUser.name
    : "کاربر ناشناس";

  const messageTime = message.createdAt
    ? format(new Date(message.createdAt), "HH:mm")
    : "";

  const isInternal = message.isInternal;
  const [menuOpen, setMenuOpen] = useState(false);

  const canEditDelete = isAgent && isOwnMessage && !message.isDeleted;

  const scrollToMessage = (targetId?: number) => {
    if (!targetId) return;
    const el = document.getElementById(`support-msg-${targetId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-amber-400", "rounded-lg");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-amber-400", "rounded-lg");
      }, 1500);
    }
  };

  return (
    <div
      className={`flex items-end gap-2 mb-4 ${
        isOwnMessage ? "flex-row-reverse" : "flex-row"
      }`}
      id={`support-msg-${message.id}`}
      dir="rtl"
    >
      {/* Avatar */}
      {showAvatar && (
        <div className="flex-shrink-0">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
              isOwnMessage
                ? "bg-teal-500"
                : isInternal
                ? "bg-purple-500"
                : "bg-gray-500"
            }`}
          >
            {senderName?.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Message Content */}
      <div
        className={`flex flex-col max-w-[70%] ${
          isOwnMessage ? "items-end" : "items-start"
        }`}
      >
        {/* Sender Name (only for received messages) */}
        {!isOwnMessage && (
          <div className="flex items-center gap-2 mb-1 px-1">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {senderName}
            </span>
            {isInternal && (
              <span className="text-xs text-purple-600 dark:text-purple-400">
                <DIcon icon="fa-lock" classCustom="ml-1 text-xs" />
                یادداشت داخلی
              </span>
            )}
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-2 relative ${
            isOwnMessage
              ? "bg-teal-500 text-white rounded-br-sm"
              : isInternal
              ? "bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100 rounded-bl-sm border border-purple-200 dark:border-purple-800"
              : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100 rounded-bl-sm"
          }`}
        >
          {/* Reply preview */}
          {message.replyTo && !message.isDeleted && (
            <div
              className={`mb-2 text-xs rounded-md px-3 py-2 cursor-pointer ${
                isOwnMessage
                  ? "bg-teal-600/40"
                  : isInternal
                  ? "bg-purple-200/60 dark:bg-purple-800/40"
                  : "bg-gray-200/70 dark:bg-gray-600/60"
              }`}
              onClick={() => scrollToMessage(message.replyTo?.id)}
              title="نمایش پیام مرجع"
            >
              <div className="opacity-80 mb-1">
                پاسخ به{" "}
                {message.replyTo?.supportAgent?.displayName ||
                  message.replyTo?.workspaceUser?.displayName ||
                  message.replyTo?.guestUser?.name ||
                  "کاربر"}
              </div>
              <div className="line-clamp-2 opacity-90">
                {message.replyTo?.isDeleted
                  ? "پیام حذف شده"
                  : message.replyTo?.body}
              </div>
            </div>
          )}

          <div className="text-sm whitespace-pre-wrap break-words">
            {message.isDeleted ? (
              <span className="opacity-80">پیام حذف شده</span>
            ) : (
              message.body
            )}
          </div>

          {/* Time & Read Status */}
          <div
            className={`text-xs mt-1 flex items-center gap-1 ${
              isOwnMessage
                ? "text-teal-100"
                : isInternal
                ? "text-purple-600 dark:text-purple-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <span>{messageTime}</span>
            {message.isEdited && <span className="opacity-80">ویرایش شده</span>}
            {isOwnMessage && message.isRead && (
              <DIcon icon="fa-check-double" classCustom="text-xs" />
            )}
            {isOwnMessage && !message.isRead && (
              <DIcon icon="fa-check" classCustom="text-xs" />
            )}
          </div>

          {/* Kebab menu - inside bubble with side-aware opening */}
          <div
            className={`absolute top-1 ${isOwnMessage ? "left-1" : "right-1"}`}
          >
            <button
              type="button"
              className={`px-2 py-1 rounded ${
                isOwnMessage ? "hover:bg-white/20" : "hover:bg-black/10"
              }`}
              onClick={() => setMenuOpen((v) => !v)}
              title="گزینه‌ها"
            >
              <DIcon icon="fa-ellipsis-v" />
            </button>
            {menuOpen && (
              <div
                className={`absolute top-7 ${
                  isOwnMessage ? "right-full mr-2" : "left-full ml-2"
                } w-32 bg-white text-gray-700 rounded-md shadow-lg z-10`}
              >
                <button
                  className="w-full text-right px-3 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setMenuOpen(false);
                    onReply?.(message);
                  }}
                >
                  ریپلای
                </button>
                {canEditDelete && (
                  <>
                    <button
                      className="w-full text-right px-3 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit?.(message);
                      }}
                    >
                      ویرایش
                    </button>
                    <button
                      className="w-full text-right px-3 py-2 hover:bg-gray-100 text-red-600"
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete?.(message);
                      }}
                    >
                      حذف
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sender label for own (optional) */}
        {isOwnMessage && showAvatar && (
          <div className="text-xs text-gray-400 mt-1 px-2">شما</div>
        )}
      </div>
    </div>
  );
}
