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
interface CustomerChatWindowProps {
  ticket: SupportTicketWithRelations;
  className?: string;
  onTicketUpdate?: (ticket: SupportTicketWithRelations) => void;
}

interface ChatState {
  messages: SupportMessageWithRelations[];
  loading: boolean;
  sending: boolean;
  error: string | null;
}

// Constants
const MESSAGE_POLLING_INTERVAL = 3000; // 3 seconds
const TYPING_DEBOUNCE_MS = 1000;

// Helper Functions
const isOwnMessage = (
  message: SupportMessageWithRelations,
  ticket: SupportTicketWithRelations
): boolean => {
  // For customer view, messages from workspaceUser or guestUser are "own" messages
  if (
    ticket.workspaceUserId &&
    message.workspaceUser?.id === ticket.workspaceUserId
  ) {
    return true;
  }
  if (ticket.guestUserId && message.guestUser?.id === ticket.guestUserId) {
    return true;
  }
  return false;
};

// Sub-components
const ChatHeader: React.FC<{
  ticket: SupportTicketWithRelations;
}> = ({ ticket }) => {
  const getStatusColor = (status: string) => {
    const colors = {
      OPEN: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20",
      IN_PROGRESS: "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
      PENDING: "text-orange-600 bg-orange-100 dark:bg-orange-900/20",
      RESOLVED: "text-green-600 bg-green-100 dark:bg-green-900/20",
      CLOSED: "text-gray-600 bg-gray-100 dark:bg-gray-900/20",
    };
    return colors[status as keyof typeof colors] || colors.OPEN;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      OPEN: "باز",
      IN_PROGRESS: "در حال بررسی",
      PENDING: "در انتظار",
      RESOLVED: "حل شده",
      CLOSED: "بسته شده",
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <DIcon
              icon="fa-headset"
              classCustom="text-blue-600 dark:text-blue-400"
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              پشتیبانی آنلاین
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              #{ticket.ticketNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              ticket.status
            )}`}
          >
            {getStatusLabel(ticket.status)}
          </span>
          {ticket.assignedTo && (
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <DIcon icon="fa-user-tie" classCustom="text-xs" />
              <span>{ticket.assignedTo.displayName}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MessageList: React.FC<{
  messages: SupportMessageWithRelations[];
  ticket: SupportTicketWithRelations;
  loading: boolean;
}> = ({ messages, ticket, loading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          در حال بارگذاری پیام‌ها...
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <DIcon icon="fa-comments" classCustom="text-4xl text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            هنوز پیامی وجود ندارد
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            اولین پیام خود را ارسال کنید
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
      {messages.map((message) => (
        <TicketMessageBubble
          key={message.id}
          message={message}
          isOwnMessage={isOwnMessage(message, ticket)}
          isAgent={false}
          showAvatar={true}
          showTime={true}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

const ErrorState: React.FC<{
  error: string;
  onRetry: () => void;
}> = ({ error, onRetry }) => (
  <div className="flex-1 flex items-center justify-center p-4">
    <div className="text-center">
      <DIcon
        icon="fa-exclamation-triangle"
        classCustom="text-4xl text-red-400 mb-4"
      />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        خطا در بارگذاری
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        تلاش مجدد
      </button>
    </div>
  </div>
);

// Main Component
const CustomerChatWindow: React.FC<CustomerChatWindowProps> = ({
  ticket,
  className = "",
  onTicketUpdate,
}) => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    loading: true,
    sending: false,
    error: null,
  });

  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const pollingIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Load messages
  const loadMessages = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch(
        `/api/support-chat/tickets/${ticket.id}/messages`
      );
      if (!response.ok) {
        throw new Error("Failed to load messages");
      }

      const data = await response.json();
      setState((prev) => ({
        ...prev,
        messages: data.messages || [],
        loading: false,
      }));
    } catch (error) {
      console.error("Error loading messages:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error.message : "خطا در بارگذاری پیام‌ها",
      }));
    }
  }, [ticket.id]);

  // Send message
  const sendMessage = useCallback(
    async (messageBody: string) => {
      if (!messageBody.trim() || state.sending) return;

      setState((prev) => ({ ...prev, sending: true }));

      try {
        const response = await fetch(
          `/api/support-chat/tickets/${ticket.id}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              body: messageBody.trim(),
              messageType: "TEXT",
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const newMessage = await response.json();
        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, newMessage],
          sending: false,
        }));
      } catch (error) {
        console.error("Error sending message:", error);
        setState((prev) => ({
          ...prev,
          sending: false,
          error: error instanceof Error ? error.message : "خطا در ارسال پیام",
        }));
      }
    },
    [ticket.id, state.sending]
  );

  // Handle typing
  const handleTyping = useCallback((typing: boolean) => {
    setIsTyping(typing);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (typing) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, TYPING_DEBOUNCE_MS);
    }
  }, []);

  // Retry loading
  const handleRetry = useCallback(() => {
    loadMessages();
  }, [loadMessages]);

  // Start polling for new messages
  useEffect(() => {
    loadMessages();

    pollingIntervalRef.current = setInterval(() => {
      loadMessages();
    }, MESSAGE_POLLING_INTERVAL);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [loadMessages]);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`h-full flex flex-col bg-gray-50 dark:bg-slate-900 ${className}`}
    >
      {/* Header */}
      <ChatHeader ticket={ticket} />

      {/* Content */}
      {state.error ? (
        <ErrorState error={state.error} onRetry={handleRetry} />
      ) : (
        <MessageList
          messages={state.messages}
          ticket={ticket}
          loading={state.loading}
        />
      )}

      {/* Typing Indicator */}
      {isTyping && (
        <div className="px-4 py-2">
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
            <span>پشتیبان در حال تایپ است...</span>
          </div>
        </div>
      )}

      {/* Message Input */}
      <TicketMessageInput
        onSend={sendMessage}
        placeholder="پیام خود را بنویسید..."
        disabled={state.sending || state.loading}
        onTyping={handleTyping}
        showFileUpload={true}
      />
    </div>
  );
};

export default CustomerChatWindow;
export type { CustomerChatWindowProps };
