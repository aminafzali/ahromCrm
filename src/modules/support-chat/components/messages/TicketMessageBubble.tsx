"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { format } from "date-fns-jalali";
import React, { useEffect, useRef, useState } from "react";
import { SupportMessageWithRelations } from "../../types";

// Types
interface TicketMessageBubbleProps {
  message: SupportMessageWithRelations;
  isOwnMessage: boolean;
  isAgent?: boolean;
  showAvatar?: boolean;
  showTime?: boolean;
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
}> = ({ message, isOwnMessage, isInternal }) => {
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
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 border-r-4 border-blue-500">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            پاسخ به:
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {message.replyTo.body}
          </div>
        </div>
      )}

      {/* Message Body */}
      <div className="whitespace-pre-wrap break-words">{message.body}</div>

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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [menuOpen]);

  const messageClasses = `
    flex gap-3 group relative
    ${isOwnMessage ? "flex-row-reverse" : "flex-row"}
    ${className}
  `.trim();

  const bubbleClasses = `
    max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 relative
    ${
      isOwnMessage
        ? "bg-blue-500 text-white rounded-br-md"
        : isInternal
        ? "bg-purple-100 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100 rounded-bl-md"
        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md"
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
          <MessageContent
            message={message}
            isOwnMessage={isOwnMessage}
            isInternal={isInternal}
          />

          {/* Menu Button */}
          {(onReply || onEdit || onDelete) && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
            >
              <DIcon icon="fa-ellipsis-v" classCustom="text-xs" />
            </button>
          )}
        </div>

        {/* Message Time */}
        {showTime && messageTime && (
          <div
            className={`text-xs text-gray-500 dark:text-gray-400 px-1 ${
              isOwnMessage ? "text-right" : "text-left"
            }`}
          >
            {messageTime}
          </div>
        )}
      </div>

      {/* Message Menu */}
      {menuOpen && (
        <div ref={menuRef}>
          <MessageMenu
            message={message}
            isOwnMessage={isOwnMessage}
            isAgent={isAgent}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onClose={() => setMenuOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default TicketMessageBubble;
export type { TicketMessageBubbleProps };
