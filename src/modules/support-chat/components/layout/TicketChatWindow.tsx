"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  SupportMessageWithRelations,
  SupportTicketWithRelations,
} from "../../types";
import TicketMessageBubble from "../messages/TicketMessageBubble";
import TicketMessageInput from "../messages/TicketMessageInput";

// Types
interface TicketChatWindowProps {
  ticket: SupportTicketWithRelations | null;
  messages: SupportMessageWithRelations[];
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
  className?: string;
}

interface MessageListProps {
  messages: SupportMessageWithRelations[];
  currentUserId?: number;
  isAgent: boolean;
  hasMore: boolean;
  onLoadMore?: () => Promise<void> | void;
  loading: boolean;
}

interface ChatHeaderProps {
  ticket: SupportTicketWithRelations;
  isAgent: boolean;
  onChangeStatus?: (status: string) => void;
  onAssign?: () => void;
}

// Constants
const SCROLL_THRESHOLD = 100;
const TYPING_DEBOUNCE_MS = 1000;

// Helper Functions
const isOwnMessage = (
  message: SupportMessageWithRelations,
  currentUserId?: number
): boolean => {
  if (!currentUserId) return false;

  // Check if message is from current user
  if (message.workspaceUser?.id === currentUserId) return true;
  if (message.supportAgent?.id === currentUserId) return true;

  return false;
};

// Sub-components
const ChatHeader: React.FC<ChatHeaderProps> = ({
  ticket,
  isAgent,
  onChangeStatus,
  onAssign,
}) => {
  const customerName =
    ticket.workspaceUser?.displayName ||
    ticket.guestUser?.name ||
    "کاربر ناشناس";

  return (
    <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-3 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <DIcon
              icon="fa-user"
              classCustom="text-blue-600 dark:text-blue-400"
            />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              {customerName}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              #{ticket.ticketNumber}
            </p>
          </div>
        </div>

        {isAgent && (
          <div className="flex items-center gap-2">
            {onChangeStatus && (
              <button
                onClick={() => onChangeStatus(ticket.status)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="تغییر وضعیت"
              >
                <DIcon icon="fa-edit" classCustom="text-sm" />
              </button>
            )}
            {onAssign && (
              <button
                onClick={onAssign}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="تخصیص تیکت"
              >
                <DIcon icon="fa-user-plus" classCustom="text-sm" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  isAgent,
  hasMore,
  onLoadMore,
  loading,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleScroll = useCallback(async () => {
    const container = messagesContainerRef.current;
    if (!container || !onLoadMore || isLoadingMore || !hasMore) return;

    const { scrollTop } = container;
    if (scrollTop <= SCROLL_THRESHOLD) {
      setIsLoadingMore(true);
      try {
        await onLoadMore();
      } finally {
        setIsLoadingMore(false);
      }
    }
  }, [onLoadMore, hasMore, isLoadingMore]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  return (
    <div
      ref={messagesContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 scrollbar-thin"
    >
      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center py-4">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore || loading}
            className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoadingMore ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                در حال بارگذاری...
              </div>
            ) : (
              "بارگذاری پیام‌های بیشتر"
            )}
          </button>
        </div>
      )}

      {/* Messages */}
      {messages.map((message) => (
        <TicketMessageBubble
          key={message.id}
          message={message}
          isOwnMessage={isOwnMessage(message, currentUserId)}
          isAgent={isAgent}
          showAvatar={true}
          showTime={true}
        />
      ))}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            در حال بارگذاری...
          </div>
        </div>
      )}

      {/* Scroll to bottom anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

const TypingIndicator: React.FC<{ typingUsers: string[] }> = ({
  typingUsers,
}) => {
  if (typingUsers.length === 0) return null;

  return (
    <div className="px-3 sm:px-6 py-2">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          />
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
        </div>
        <span>
          {typingUsers.length === 1
            ? `${typingUsers[0]} در حال تایپ است...`
            : `${typingUsers.length} نفر در حال تایپ هستند...`}
        </span>
      </div>
    </div>
  );
};

// Main Component
const TicketChatWindow: React.FC<TicketChatWindowProps> = ({
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
  className = "",
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleTyping = useCallback(
    (typing: boolean) => {
      setIsTyping(typing);
      onTyping?.(typing);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (typing) {
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          onTyping?.(false);
        }, TYPING_DEBOUNCE_MS);
      }
    },
    [onTyping]
  );

  const handleSendMessage = useCallback(
    (message: string) => {
      onSendMessage(message, false);
    },
    [onSendMessage]
  );

  const handleSendInternalMessage = useCallback(
    (message: string) => {
      onSendMessage(message, true);
    },
    [onSendMessage]
  );

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (!ticket) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <DIcon icon="fa-comments" classCustom="text-4xl text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            تیکتی انتخاب نشده است
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-full bg-gray-50 dark:bg-slate-900 ${className}`}
    >
      {/* Header */}
      <ChatHeader
        ticket={ticket}
        isAgent={isAgent}
        onChangeStatus={onChangeStatus}
        onAssign={onAssign}
      />

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        isAgent={isAgent}
        hasMore={hasMore}
        onLoadMore={onLoadMore}
        loading={loading}
      />

      {/* Typing Indicator */}
      <TypingIndicator typingUsers={typingUsers} />

      {/* Message Input */}
      <TicketMessageInput
        onSend={handleSendMessage}
        placeholder="پیام خود را بنویسید..."
        disabled={loading}
        onTyping={handleTyping}
        showFileUpload={true}
      />
    </div>
  );
};

export default TicketChatWindow;
export type { TicketChatWindowProps };
