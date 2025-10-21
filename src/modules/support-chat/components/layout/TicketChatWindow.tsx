"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
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
  onReplyMessage?: (message: SupportMessageWithRelations) => void;
  onEditMessage?: (message: SupportMessageWithRelations) => void;
  onDeleteMessage?: (message: SupportMessageWithRelations) => void;
  onTyping?: (isTyping: boolean) => void;
  typingUsers?: string[];
  onlineUsers?: number[];
  loading?: boolean;
  onChangeStatus?: (status: string) => void;
  onAssign?: () => void;
  hasMore?: boolean;
  onLoadMore?: () => Promise<void> | void;
  autoScrollSignal?: number;
  composerValue?: string;
  composerMode?: "reply" | "edit" | null;
  composerPreview?: string;
  onComposerChange?: (value: string) => void;
  onComposerCancel?: () => void;
  className?: string;
}

interface ChatHeaderProps {
  ticket: SupportTicketWithRelations;
  isAgent: boolean;
  onChangeStatus?: (status: string) => void;
  onAssign?: () => void;
  onlineUsers?: number[];
}

// Constants
const TYPING_DEBOUNCE_MS = 1000;

// State management with reducer
interface ChatState {
  composerValue: string;
  composerMode: "reply" | "edit" | null;
  composerPreview: string;
  isTyping: boolean;
  otherTyping: boolean;
  typingUsers: string[];
  onlineUsers: number[];
  autoScrollSignal: number;
  hasMore: boolean;
  loadingMore: boolean;
  error: string | null;
  showLoadOlder: boolean;
  showScrollBottom: boolean;
}

type ChatAction =
  | { type: "SET_COMPOSER_VALUE"; payload: string }
  | { type: "SET_COMPOSER_MODE"; payload: "reply" | "edit" | null }
  | { type: "SET_COMPOSER_PREVIEW"; payload: string }
  | { type: "SET_TYPING"; payload: boolean }
  | { type: "SET_OTHER_TYPING"; payload: boolean }
  | { type: "SET_TYPING_USERS"; payload: string[] }
  | { type: "SET_ONLINE_USERS"; payload: number[] }
  | { type: "SET_AUTO_SCROLL"; payload: number }
  | { type: "SET_HAS_MORE"; payload: boolean }
  | { type: "SET_LOADING_MORE"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_SHOW_LOAD_OLDER"; payload: boolean }
  | { type: "SET_SHOW_SCROLL_BOTTOM"; payload: boolean }
  | { type: "RESET_COMPOSER" };

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case "SET_COMPOSER_VALUE":
      return { ...state, composerValue: action.payload };
    case "SET_COMPOSER_MODE":
      return { ...state, composerMode: action.payload };
    case "SET_COMPOSER_PREVIEW":
      return { ...state, composerPreview: action.payload };
    case "SET_TYPING":
      return { ...state, isTyping: action.payload };
    case "SET_OTHER_TYPING":
      return { ...state, otherTyping: action.payload };
    case "SET_TYPING_USERS":
      return { ...state, typingUsers: action.payload };
    case "SET_ONLINE_USERS":
      return { ...state, onlineUsers: action.payload };
    case "SET_AUTO_SCROLL":
      return { ...state, autoScrollSignal: action.payload };
    case "SET_HAS_MORE":
      return { ...state, hasMore: action.payload };
    case "SET_LOADING_MORE":
      return { ...state, loadingMore: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_SHOW_LOAD_OLDER":
      return { ...state, showLoadOlder: action.payload };
    case "SET_SHOW_SCROLL_BOTTOM":
      return { ...state, showScrollBottom: action.payload };
    case "RESET_COMPOSER":
      return {
        ...state,
        composerValue: "",
        composerMode: null,
        composerPreview: "",
      };
    default:
      return state;
  }
};

const initialState: ChatState = {
  composerValue: "",
  composerMode: null,
  composerPreview: "",
  isTyping: false,
  otherTyping: false,
  typingUsers: [],
  onlineUsers: [],
  autoScrollSignal: 0,
  hasMore: false,
  loadingMore: false,
  error: null,
  showLoadOlder: false,
  showScrollBottom: false,
};

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
  onlineUsers = [],
}) => {
  const customerName =
    ticket.workspaceUser?.displayName ||
    ticket.guestUser?.name ||
    "کاربر ناشناس";

  const getStatusColor = (status: string) => {
    const colors = {
      OPEN: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
      IN_PROGRESS:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      PENDING:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
      RESOLVED:
        "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      CLOSED:
        "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
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
    <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Customer Avatar */}
          <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-blue-400">
            <DIcon icon="fa-user" classCustom="text-xl" />
          </div>

          {/* Customer Info */}
          <div>
            <h3 className="font-bold text-lg">{customerName}</h3>
            <div className="text-sm opacity-90 flex items-center gap-2">
              <span>#{ticket.ticketNumber}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  ticket.status
                )}`}
              >
                {getStatusLabel(ticket.status)}
              </span>
              {/* Online Status */}
              {ticket.workspaceUserId &&
                onlineUsers.includes(ticket.workspaceUserId) && (
                  <span className="flex items-center gap-1 text-green-300">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    آنلاین
                  </span>
                )}
            </div>
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
                <DIcon icon="fa-edit" />
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
            <button
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="تنظیمات"
            >
              <DIcon icon="fa-ellipsis-v" />
            </button>
          </div>
        )}
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
  onReplyMessage,
  onEditMessage,
  onDeleteMessage,
  onTyping,
  typingUsers = [],
  onlineUsers = [],
  loading = false,
  onChangeStatus,
  onAssign,
  hasMore = false,
  onLoadMore,
  autoScrollSignal,
  composerValue,
  composerMode,
  composerPreview,
  onComposerChange,
  onComposerCancel,
  className = "",
}) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isMountedRef = useRef(true);

  // Refs for smart scroll detection (from internal-chat)
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const lastNearBottomAtRef = useRef<number>(0);
  const prevMessagesLenRef = useRef<number>(messages.length);
  const prevFirstIdRef = useRef<any>(messages[0]?.id);
  const isTypingRef = useRef<boolean>(false);

  // Socket connection state
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [socketTypingUsers, setSocketTypingUsers] = useState<string[]>([]);
  const [socketOnlineUsers, setSocketOnlineUsers] = useState<number[]>([]);

  // Smart scroll functions (from internal-chat)
  const getDistanceFromBottom = (): number => {
    const el = listRef.current;
    if (!el) return Number.MAX_SAFE_INTEGER;
    return el.scrollHeight - el.scrollTop - el.clientHeight;
  };

  const isNearBottom = (threshold = 160): boolean => {
    return getDistanceFromBottom() <= threshold;
  };

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

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
  }, [autoScrollSignal, scrollToBottom]);

  // Auto-scroll when new message arrives and user is near bottom, or when it's own message
  useEffect(() => {
    const len = messages.length;
    const newFirstId = messages[0]?.id;
    const appended =
      len > (prevMessagesLenRef.current || 0) &&
      newFirstId === prevFirstIdRef.current; // last changed
    const prepended =
      len > (prevMessagesLenRef.current || 0) &&
      newFirstId !== prevFirstIdRef.current; // older loaded at top

    if (appended) {
      const last = messages[len - 1];
      const own = isOwnMessage(last, currentUserId);
      if (own || isNearBottom(220)) {
        // two RAFs to ensure layout settled
        const id = requestAnimationFrame(() => {
          const id2 = requestAnimationFrame(() => scrollToBottom());
          return () => cancelAnimationFrame(id2);
        });
        return () => cancelAnimationFrame(id);
      }
    }

    // update trackers after decision
    prevMessagesLenRef.current = len;
    prevFirstIdRef.current = newFirstId;
  }, [messages.length, currentUserId, scrollToBottom]);

  // Track visibility states for top/bottom buttons
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    let ticking = false;
    const updateStates = () => {
      const TOP_THRESHOLD_PX = 60;
      const BOTTOM_THRESHOLD_PX = 140;
      dispatch({
        type: "SET_SHOW_LOAD_OLDER",
        payload: el.scrollTop <= TOP_THRESHOLD_PX && !!hasMore,
      });
      const distanceFromBottom = getDistanceFromBottom();
      const near = distanceFromBottom <= BOTTOM_THRESHOLD_PX;
      dispatch({ type: "SET_SHOW_SCROLL_BOTTOM", payload: !near });
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
  }, [hasMore, messages.length]);

  // Track typing state from MessageInput to suppress near-bottom triggers
  const handleTyping = useCallback(
    (val: boolean) => {
      isTypingRef.current = !!val;
      onTyping?.(val);
    },
    [onTyping]
  );

  // Socket connection functions
  const connectSocket = useCallback(() => {
    if (socketRef.current || !ticket?.id) return;

    console.log(
      "🔌 [TicketChatWindow] Connecting to socket for ticket:",
      ticket.id
    );

    const socket = io({
      path: "/api/socket_io",
      auth: {
        ticketId: ticket.id,
        workspaceUserId: currentUserId,
        isAgent: isAgent,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ [TicketChatWindow] Socket connected");
      setConnected(true);

      // Join ticket room
      if (ticket?.id) {
        socket.emit("support-chat:join", ticket.id);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ [TicketChatWindow] Socket disconnected");
      setConnected(false);
    });

    // Message handlers
    socket.on(
      "support-chat:message-received",
      (message: SupportMessageWithRelations) => {
        console.log("📨 [TicketChatWindow] New message received:", message);
        // Handle new message - you might want to add this to parent component
      }
    );

    socket.on(
      "support-chat:typing",
      (data: { isTyping: boolean; userId?: number; userName?: string }) => {
        console.log("⌨️ [TicketChatWindow] Typing event:", data);
        // Only show typing for other users, not for current agent
        if (data.userId && data.userId !== currentUserId && data.userName) {
          if (data.isTyping) {
            setSocketTypingUsers((prev) => {
              if (!prev.includes(data.userName!)) {
                return [...prev, data.userName!];
              }
              return prev;
            });
          } else {
            setSocketTypingUsers((prev) =>
              prev.filter((name) => name !== data.userName)
            );
          }
        }
      }
    );

    // Listen for message edited
    socket.on("support-chat:message-edited", (data: any) => {
      console.log("✏️ [TicketChatWindow] Message edited:", data);
      // This will be handled by parent component
    });

    // Listen for message deleted
    socket.on("support-chat:message-deleted", (data: any) => {
      console.log("🗑️ [TicketChatWindow] Message deleted:", data);
      // This will be handled by parent component
    });

    socket.on("support-chat:user-online", (data: { userId: number }) => {
      console.log("🟢 [TicketChatWindow] User online:", data);
      setSocketOnlineUsers((prev) => {
        if (!prev.includes(data.userId)) {
          return [...prev, data.userId];
        }
        return prev;
      });
    });

    socket.on("support-chat:user-offline", (data: { userId: number }) => {
      console.log("🔴 [TicketChatWindow] User offline:", data);
      setSocketOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
    });
  }, [ticket?.id, currentUserId, isAgent]);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      console.log("🔌 [TicketChatWindow] Disconnecting socket");
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
      setSocketTypingUsers([]);
      setSocketOnlineUsers([]);
    }
  }, []);

  // Send message via socket
  const sendMessageViaSocket = useCallback(
    (message: string, isInternal: boolean = false) => {
      if (!socketRef.current || !ticket?.id) return;

      console.log("📤 [TicketChatWindow] Sending message via socket:", message);

      socketRef.current.emit("support-chat:send-message", {
        ticketId: ticket.id,
        body: message,
        isInternal,
      });
    },
    [ticket?.id]
  );

  // Socket connection management
  useEffect(() => {
    if (ticket?.id) {
      connectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [ticket?.id, connectSocket, disconnectSocket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      disconnectSocket();
    };
  }, [disconnectSocket]);

  // Debounced typing indicator
  const debouncedTyping = useCallback(
    (typing: boolean) => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (typing) {
        // Send typing event via socket only - don't show locally for agent
        if (socketRef.current && ticket?.id) {
          socketRef.current.emit("support-chat:typing", {
            ticketId: ticket.id,
            isTyping: true,
            userId: currentUserId,
          });
        }

        typingTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            // Send stop typing via socket
            if (socketRef.current && ticket?.id) {
              socketRef.current.emit("support-chat:typing", {
                ticketId: ticket.id,
                isTyping: false,
                userId: currentUserId,
              });
            }
          }
        }, TYPING_DEBOUNCE_MS);
      }
    },
    [ticket?.id, currentUserId]
  );

  const handleSendMessage = useCallback(
    (message: string) => {
      // Send via socket if connected
      if (socketRef.current && ticket?.id) {
        sendMessageViaSocket(message, false);
      }
      // Also send via parent callback for API fallback
      onSendMessage(message, false);
    },
    [onSendMessage, sendMessageViaSocket, ticket?.id]
  );

  const handleSendInternalMessage = useCallback(
    (message: string) => {
      // Send via socket if connected
      if (socketRef.current && ticket?.id) {
        sendMessageViaSocket(message, true);
      }
      // Also send via parent callback for API fallback
      onSendMessage(message, true);
    },
    [onSendMessage, sendMessageViaSocket, ticket?.id]
  );

  // File upload handler
  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!ticket?.id) return;

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("ticketId", ticket.id.toString());

        // Add user info for registered users
        if (currentUserId) {
          formData.append("workspaceUserId", currentUserId.toString());
          formData.append("workspaceId", "1"); // You might want to get this from context
        }

        const response = await fetch("/api/support-chat/public/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload file");
        }

        const result = await response.json();

        // Send file as message
        const fileMessage = `📎 فایل: ${result.fileName} - ${result.fileUrl}`;
        handleSendMessage(fileMessage);
      } catch (error) {
        console.error("File upload failed:", error);
        alert("خطا در آپلود فایل");
      }
    },
    [ticket?.id, currentUserId, handleSendMessage]
  );

  // Load more messages with triple-pass adjustment
  const handleLoadMore = useCallback(async () => {
    if (!onLoadMore || !listRef.current) return;

    const el = listRef.current;
    const prevHeight = el.scrollHeight;
    const prevTop = el.scrollTop;
    const prevBehavior = (el.style as any).scrollBehavior;
    (el.style as any).scrollBehavior = "auto";

    await onLoadMore();

    // Triple-pass adjustment for Chrome stability
    const adjust = () => {
      const delta = el.scrollHeight - prevHeight;
      el.scrollTop = prevTop + delta;
    };

    // Force layout read between passes
    requestAnimationFrame(() => {
      void el.getBoundingClientRect();
      adjust();
      requestAnimationFrame(() => {
        void el.getBoundingClientRect();
        adjust();
        setTimeout(() => {
          adjust();
          (el.style as any).scrollBehavior = prevBehavior || "";
        }, 0);
      });
    });
  }, [onLoadMore]);

  console.log("🪟 [TicketChatWindow] Rendering with:", {
    ticketId: ticket?.id,
    messagesCount: messages.length,
    currentUserId,
  });

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
      className={`flex flex-col h-full w-full bg-white relative ${className}`}
    >
      {/* Header */}
      <ChatHeader
        ticket={ticket}
        isAgent={isAgent}
        onChangeStatus={onChangeStatus}
        onAssign={onAssign}
        onlineUsers={onlineUsers}
      />

      {/* Messages */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          overflowAnchor: "none", // prevent Chrome's scroll anchoring from jumping to bottom
        }}
      >
        {/* Connection Status */}
        <div className="sticky top-0 z-20 flex justify-center mb-2">
          <div
            className={`px-3 py-1 rounded-full text-xs flex items-center gap-2 ${
              connected
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-yellow-100 text-yellow-700 border border-yellow-200"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                connected ? "bg-green-500" : "bg-yellow-500"
              }`}
            />
            {connected ? "متصل" : "در حال اتصال..."}
            {onlineUsers.length > 0 && (
              <span className="text-xs opacity-75">
                ({onlineUsers.length} آنلاین)
              </span>
            )}
          </div>
        </div>

        {/* Sticky Load More Button */}
        {state.showLoadOlder && (
          <div className="sticky top-0 z-10 flex justify-center">
            <button
              className="mt-1 mb-3 inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-full bg-white/80 backdrop-blur border border-gray-200 shadow hover:bg-white transition"
              onClick={handleLoadMore}
              disabled={loading}
              title="نمایش پیام‌های قبلی"
            >
              <DIcon icon="fa-arrow-up" />
              <span>پیام‌های قبلی</span>
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-2">
          {messages.map((message, index) => {
            const isOwnMsg = isOwnMessage(message, currentUserId);
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const showAvatar =
              !prevMessage ||
              prevMessage.workspaceUser?.id !== message.workspaceUser?.id ||
              prevMessage.supportAgent?.id !== message.supportAgent?.id;

            return (
              <TicketMessageBubble
                key={message.id}
                message={message}
                isOwnMessage={isOwnMsg}
                isAgent={isAgent}
                showAvatar={showAvatar}
                showTime={true}
                currentUserId={currentUserId}
                onReply={onReplyMessage}
                onEdit={onEditMessage}
                onDelete={onDeleteMessage}
              />
            );
          })}
        </div>

        {/* Typing Indicators */}
        {socketTypingUsers.length > 0 && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-md">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
                <span className="text-xs text-gray-600 font-medium">
                  {socketTypingUsers.join(", ")} در حال تایپ...
                </span>
              </div>
            </div>
          </div>
        )}

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

        {/* Floating scroll-to-bottom button */}
        {state.showScrollBottom && (
          <button
            className="absolute right-4 w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 flex items-center justify-center z-30 transition-all duration-200"
            style={{ bottom: 100 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              scrollToBottom();
            }}
            title="آخرین پیام"
            aria-label="آخرین پیام"
          >
            <DIcon icon="fa-arrow-down" classCustom="text-white text-lg" />
          </button>
        )}
      </div>

      {/* Message Input */}
      <TicketMessageInput
        onSend={handleSendMessage}
        placeholder="پیام خود را بنویسید..."
        disabled={loading}
        onTyping={debouncedTyping}
        showFileUpload={true}
        onFileUpload={handleFileUpload}
        isInternal={isAgent}
        value={composerValue}
        onChangeValue={onComposerChange}
        actionMode={composerMode}
        actionPreview={composerPreview}
        onCancelAction={onComposerCancel}
      />
    </div>
  );
};

// Memoized component for performance
const MemoizedTicketChatWindow = React.memo(
  TicketChatWindow,
  (prevProps, nextProps) => {
    // Custom comparison function for better performance
    return (
      prevProps.ticket?.id === nextProps.ticket?.id &&
      prevProps.messages.length === nextProps.messages.length &&
      prevProps.currentUserId === nextProps.currentUserId &&
      prevProps.isAgent === nextProps.isAgent &&
      prevProps.loading === nextProps.loading &&
      prevProps.hasMore === nextProps.hasMore &&
      prevProps.autoScrollSignal === nextProps.autoScrollSignal &&
      prevProps.composerValue === nextProps.composerValue &&
      prevProps.composerMode === nextProps.composerMode &&
      prevProps.composerPreview === nextProps.composerPreview &&
      prevProps.typingUsers?.length === nextProps.typingUsers?.length &&
      prevProps.onlineUsers?.length === nextProps.onlineUsers?.length
    );
  }
);

MemoizedTicketChatWindow.displayName = "TicketChatWindow";

export default MemoizedTicketChatWindow;
export type { TicketChatWindowProps };
