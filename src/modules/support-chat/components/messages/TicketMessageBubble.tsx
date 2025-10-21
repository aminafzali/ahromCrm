"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { format } from "date-fns-jalali";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SupportMessageWithRelations } from "../../types";

// Types
interface TicketMessageBubbleProps {
  message: SupportMessageWithRelations;
  isOwnMessage: boolean;
  isAgent?: boolean;
  showAvatar?: boolean;
  showTime?: boolean;
  currentUserId?: number;
  onReply?: (message: SupportMessageWithRelations) => void;
  onEdit?: (message: SupportMessageWithRelations) => void;
  onDelete?: (message: SupportMessageWithRelations) => void;
  className?: string;
}

interface MessageMenuProps {
  message: SupportMessageWithRelations;
  isOwnMessage: boolean;
  isAgent: boolean;
  onReply?: (message: SupportMessageWithRelations) => void;
  onEdit?: (message: SupportMessageWithRelations) => void;
  onDelete?: (message: SupportMessageWithRelations) => void;
  onClose: () => void;
}

// Constants
const MESSAGE_TYPES = {
  TEXT: "TEXT",
  IMAGE: "IMAGE",
  FILE: "FILE",
  SYSTEM: "SYSTEM",
} as const;

// Helper Functions
const getSenderName = (message: SupportMessageWithRelations): string => {
  if (message.supportAgent?.displayName) {
    return message.supportAgent.displayName;
  }
  if (message.workspaceUser?.displayName) {
    return message.workspaceUser.displayName;
  }
  if (message.guestUser?.name) {
    return message.guestUser.name;
  }
  return "کاربر ناشناس";
};

const getSenderInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatMessageTime = (dateString: string): string => {
  try {
    return format(new Date(dateString), "HH:mm");
  } catch {
    return "";
  }
};

const scrollToMessage = (targetId: number): void => {
  const element = document.getElementById(`support-msg-${targetId}`);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};

// XSS Protection - Sanitize HTML content
const sanitizeHtml = (html: string): string => {
  // Remove potentially dangerous tags and attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, "")
    .replace(/<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/vbscript:/gi, "")
    .replace(/data:/gi, "");
};

// Format message content with XSS protection
const formatMessageContent = (content: string): string => {
  if (!content) return "";

  // First sanitize the content
  const sanitized = sanitizeHtml(content);

  // Then apply basic formatting
  return sanitized
    .replace(/\n/g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /`(.*?)`/g,
      '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>'
    );
};

// Sub-components
const MessageAvatar: React.FC<{
  message: SupportMessageWithRelations;
  isOwnMessage: boolean;
  showAvatar: boolean;
}> = ({ message, isOwnMessage, showAvatar }) => {
  if (!showAvatar) return null;

  const senderName = getSenderName(message);
  const initials = getSenderInitials(senderName);
  const isInternal = message.isInternal;

  return (
    <div
      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
        isInternal
          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
          : isOwnMessage
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
          : "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300"
      }`}
    >
      {initials}
    </div>
  );
};

const MessageContent: React.FC<{
  message: SupportMessageWithRelations;
  isOwnMessage: boolean;
  isInternal: boolean;
  currentUserId?: number;
  formattedContent: string;
}> = ({
  message,
  isOwnMessage,
  isInternal,
  currentUserId,
  formattedContent,
}) => {
  if (message.isDeleted) {
    return (
      <div className="text-gray-500 dark:text-gray-400 italic text-sm">
        <DIcon icon="fa-trash" classCustom="ml-1 text-xs" />
        پیام حذف شده
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Reply Reference */}
      {message.replyTo && !message.replyTo.isDeleted && (
        <div
          className={`mb-2 text-xs rounded-md px-3 py-2 cursor-pointer ${
            isOwnMessage
              ? "bg-blue-600/40"
              : "bg-gray-50 dark:bg-gray-800 border-r-4 border-blue-500"
          }`}
          onClick={() =>
            message.replyTo?.id && scrollToMessage(message.replyTo.id)
          }
          title="نمایش پیام مرجع"
        >
          <div
            className={`mb-1 ${
              isOwnMessage ? "opacity-80" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            پاسخ به{" "}
            {message.replyTo?.supportAgent?.displayName ||
              message.replyTo?.workspaceUser?.displayName ||
              message.replyTo?.guestUser?.name ||
              "کاربر"}
          </div>
          <div
            className={`line-clamp-2 ${
              isOwnMessage ? "opacity-90" : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {message.replyTo.isDeleted ? "پیام حذف شده" : message.replyTo.body}
          </div>
        </div>
      )}

      {/* Message Body */}
      <div
        className="whitespace-pre-wrap break-words"
        dangerouslySetInnerHTML={{ __html: formattedContent }}
      />

      {/* Edit Indicator */}
      {message.isEdited && (
        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
          <DIcon icon="fa-edit" classCustom="ml-1" />
          ویرایش شده
        </div>
      )}

      {/* Internal Message Indicator */}
      {isInternal && (
        <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
          <DIcon icon="fa-lock" classCustom="ml-1" />
          پیام داخلی
        </div>
      )}
    </div>
  );
};

const MessageMenu: React.FC<MessageMenuProps> = ({
  message,
  isOwnMessage,
  isAgent,
  onReply,
  onEdit,
  onDelete,
  onClose,
}) => {
  const canEditDelete = isAgent && isOwnMessage && !message.isDeleted;

  return (
    <div className="absolute top-0 right-0 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-10 min-w-32">
      {onReply && (
        <button
          onClick={() => {
            onReply(message);
            onClose();
          }}
          className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
        >
          <DIcon icon="fa-reply" classCustom="text-xs" />
          پاسخ
        </button>
      )}

      {canEditDelete && onEdit && (
        <button
          onClick={() => {
            onEdit(message);
            onClose();
          }}
          className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
        >
          <DIcon icon="fa-edit" classCustom="text-xs" />
          ویرایش
        </button>
      )}

      {canEditDelete && onDelete && (
        <button
          onClick={() => {
            onDelete(message);
            onClose();
          }}
          className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
        >
          <DIcon icon="fa-trash" classCustom="text-xs" />
          حذف
        </button>
      )}
    </div>
  );
};

// Main Component
const TicketMessageBubble: React.FC<TicketMessageBubbleProps> = ({
  message,
  isOwnMessage,
  isAgent = true,
  showAvatar = true,
  showTime = true,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  className = "",
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  const senderName = getSenderName(message);
  const messageTime = formatMessageTime(message.createdAt);
  const isInternal = message.isInternal;

  // Memoized formatted content with XSS protection
  const formattedContent = useMemo(() => {
    return formatMessageContent(message.body || "");
  }, [message.body]);

  // Memoized event handlers
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setMenuOpen(false);
    }
  }, []);

  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setMenuOpen(false);
    }
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen, handleClickOutside]);

  // Close menu on escape key
  useEffect(() => {
    if (menuOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [menuOpen, handleEscape]);

  const messageClasses = `
    flex gap-3 group relative mb-4
    ${isOwnMessage ? "justify-start" : "justify-end"}
    ${className}
  `.trim();

  const bubbleClasses = `
    max-w-[80%] sm:max-w-[70%] md:max-w-[60%] lg:max-w-[50%] xl:max-w-[45%] rounded-2xl px-4 py-3 relative shadow-md min-w-[200px]
    ${
      isOwnMessage
        ? "bg-blue-500 text-white rounded-bl-md pl-8"
        : isInternal
        ? "bg-purple-100 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100 rounded-br-md"
        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-br-md"
    }
  `.trim();

  return (
    <div
      ref={messageRef}
      className={messageClasses}
      id={`support-msg-${message.id}`}
    >
      <MessageAvatar
        message={message}
        isOwnMessage={isOwnMessage}
        showAvatar={showAvatar}
      />

      <div className="flex flex-col gap-1">
        {/* Sender Name */}
        {!isOwnMessage && (
          <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
            {senderName}
          </div>
        )}

        {/* Message Bubble */}
        <div className={bubbleClasses}>
          {/* Kebab Menu (inside bubble for own messages) */}
          {isOwnMessage &&
            !message.isDeleted &&
            (onReply || onEdit || onDelete) && (
              <div className="absolute top-1 left-1" ref={menuRef}>
                <button
                  type="button"
                  className="px-2 py-1 hover:bg-white/10 rounded"
                  onClick={() => setMenuOpen(!menuOpen)}
                  title="گزینه‌ها"
                >
                  <DIcon icon="fa-ellipsis-v" />
                </button>
                {menuOpen && (
                  <div className="absolute top-7 right-full mr-2 w-28 bg-white text-gray-700 rounded-md shadow-lg z-10">
                    {onReply && (
                      <button
                        className="w-full text-right px-3 py-2 hover:bg-gray-100"
                        onClick={() => {
                          setMenuOpen(false);
                          onReply(message);
                        }}
                      >
                        پاسخ
                      </button>
                    )}
                    {onEdit && (
                      <button
                        className="w-full text-right px-3 py-2 hover:bg-gray-100"
                        onClick={() => {
                          setMenuOpen(false);
                          onEdit(message);
                        }}
                      >
                        ویرایش
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="w-full text-right px-3 py-2 hover:bg-gray-100 text-red-600"
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete(message);
                        }}
                      >
                        حذف
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

          <MessageContent
            message={message}
            isOwnMessage={isOwnMessage}
            isInternal={isInternal}
            currentUserId={currentUserId}
            formattedContent={formattedContent}
          />

          {/* Status indicators for own messages */}
          {isOwnMessage && showTime && (
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
                  <DIcon icon="fa-check" classCustom="text-xs text-blue-300" />
                </span>
              )}
            </div>
          )}
        </div>

        {/* Message Time (only for other messages) */}
        {showTime && messageTime && !isOwnMessage && (
          <div className="text-xs text-gray-500 dark:text-gray-400 px-1 text-left">
            {messageTime}
          </div>
        )}
      </div>
    </div>
  );
};

// Memoized component for performance
const MemoizedTicketMessageBubble = React.memo(
  TicketMessageBubble,
  (prevProps, nextProps) => {
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.body === nextProps.message.body &&
      prevProps.message.isEdited === nextProps.message.isEdited &&
      prevProps.message.isDeleted === nextProps.message.isDeleted &&
      prevProps.isOwnMessage === nextProps.isOwnMessage &&
      prevProps.isAgent === nextProps.isAgent &&
      prevProps.showAvatar === nextProps.showAvatar &&
      prevProps.showTime === nextProps.showTime &&
      prevProps.currentUserId === nextProps.currentUserId
    );
  }
);

MemoizedTicketMessageBubble.displayName = "TicketMessageBubble";

export default MemoizedTicketMessageBubble;
export type { TicketMessageBubbleProps };
