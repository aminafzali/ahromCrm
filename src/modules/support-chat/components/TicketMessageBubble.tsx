"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { format } from "date-fns-jalali";
import { useEffect, useRef, useState } from "react";
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
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (!menuOpen) return;
    const handleDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [menuOpen]);

  // پیام‌های من (سمت راست، آبی)
  if (isOwnMessage) {
    return (
      <div
        className="flex justify-start mb-4"
        dir="rtl"
        id={`support-msg-${message.id}`}
      >
        {/* آواتار سمت راست */}
        {showAvatar && (
          <div className="ml-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {senderName?.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        <div className="flex flex-col items-start max-w-[70%]">
          {/* نام فرستنده */}
          {showAvatar && (
            <div className="text-xs text-gray-400 mb-1 px-2">شما</div>
          )}

          {/* حباب پیام */}
          <div className="bg-blue-500 text-white rounded-2xl rounded-bl-md px-4 py-3 shadow-md relative pl-8">
            {/* Kebab (inside bubble, opens to left) */}
            {canEditDelete && (
              <div className="absolute top-1 left-1" ref={menuRef}>
                <button
                  type="button"
                  className="px-2 py-1 hover:bg-white/10 rounded"
                  onClick={() => setMenuOpen((v) => !v)}
                  title="گزینه‌ها"
                >
                  <DIcon icon="fa-ellipsis-v" />
                </button>
                {menuOpen && (
                  <div className="absolute top-7 right-full mr-2 w-28 bg-white text-gray-700 rounded-md shadow-lg z-10">
                    <button
                      className="w-full text-right px-3 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setMenuOpen(false);
                        onReply?.(message);
                      }}
                    >
                      پاسخ
                    </button>
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
                  </div>
                )}
              </div>
            )}

            {/* پیش‌نمایش ریپلای */}
            {message.replyTo && !message.isDeleted && (
              <div
                className="mb-2 text-xs bg-blue-600/40 rounded-md px-3 py-2 cursor-pointer"
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
            <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
              {message.isDeleted ? (
                <span className="opacity-80">پیام حذف شده</span>
              ) : (
                message.body
              )}
            </div>

            {/* زمان و وضعیت */}
            {showTime && (
              <div className="flex items-center justify-start gap-2 mt-2 text-xs text-blue-100">
                <span>{messageTime}</span>
                {message.isEdited && (
                  <span className="opacity-80">ویرایش شده</span>
                )}
                {message.isRead ? (
                  <span title="خوانده شده">
                    <DIcon
                      icon="fa-check-double"
                      classCustom="text-xs text-blue-200"
                    />
                  </span>
                ) : (
                  <span title="ارسال شده">
                    <DIcon
                      icon="fa-check"
                      classCustom="text-xs text-blue-300"
                    />
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // پیام‌های دیگران (سمت چپ، خاکستری یا بنفش)
  return (
    <div
      className="flex justify-end mb-4"
      dir="rtl"
      id={`support-msg-${message.id}`}
    >
      <div className="flex flex-col items-end max-w-[70%]">
        {/* نام فرستنده */}
        {showAvatar && (
          <div className="text-xs font-medium text-gray-600 mb-1 px-2">
            {senderName}
            {isInternal && (
              <span className="text-xs text-purple-600 ml-2">
                <DIcon icon="fa-lock" classCustom="ml-1 text-xs" />
                یادداشت داخلی
              </span>
            )}
          </div>
        )}

        {/* حباب پیام */}
        <div
          className={`rounded-2xl rounded-br-md px-4 py-3 shadow-sm relative pr-8 ${
            isInternal
              ? "bg-purple-100 text-purple-900 border border-purple-200"
              : "bg-gray-200 text-gray-900"
          }`}
        >
          {/* Kebab (inside bubble, opens to right) */}
          {!message.isDeleted && (
            <div className="absolute top-1 right-1" ref={menuRef}>
              <button
                type="button"
                className="px-2 py-1 hover:bg-black/10 rounded"
                onClick={() => setMenuOpen((v) => !v)}
                title="گزینه‌ها"
              >
                <DIcon icon="fa-ellipsis-v" />
              </button>
              {menuOpen && (
                <div className="absolute top-7 left-full ml-2 w-28 bg-white text-gray-700 rounded-md shadow-lg z-10">
                  <button
                    className="w-full text-right px-3 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setMenuOpen(false);
                      onReply?.(message);
                    }}
                  >
                    پاسخ
                  </button>
                </div>
              )}
            </div>
          )}

          {/* پیش‌نمایش ریپلای */}
          {message.replyTo && !message.isDeleted && (
            <div
              className={`mb-2 text-xs rounded-md px-3 py-2 cursor-pointer ${
                isInternal ? "bg-purple-200/60" : "bg-gray-300/60"
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
          <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
            {message.isDeleted ? (
              <span className="text-gray-500">پیام حذف شده</span>
            ) : (
              message.body
            )}
          </div>

          {/* زمان */}
          {showTime && (
            <div className="flex items-center justify-end gap-2 mt-2 text-xs text-gray-500">
              <span>{messageTime}</span>
              {message.isEdited && (
                <span className="opacity-80">ویرایش شده</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* آواتار سمت چپ */}
      {showAvatar && (
        <div className="mr-2 flex-shrink-0">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm ${
              isInternal ? "bg-purple-500" : "bg-gray-500"
            }`}
          >
            {senderName?.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );
}
