"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import React, { useCallback, useEffect, useReducer, useRef } from "react";
import { io, Socket } from "socket.io-client";
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
  currentUser?: {
    type: "registered" | "guest";
    id: number | string;
  };
}

// Constants
const MESSAGE_POLLING_INTERVAL = 5000; // 5 seconds - reduced frequency
const TYPING_DEBOUNCE_MS = 1000;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

// State management with reducer
interface CustomerChatState {
  messages: SupportMessageWithRelations[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  hasMore: boolean;
  loadingMore: boolean;
  isTyping: boolean;
  otherTyping: boolean;
  retryCount: number;
  isOnline: boolean;
  showLoadOlder: boolean;
  showScrollBottom: boolean;
}

type CustomerChatAction =
  | { type: "SET_MESSAGES"; payload: SupportMessageWithRelations[] }
  | { type: "ADD_MESSAGE"; payload: SupportMessageWithRelations }
  | {
      type: "UPDATE_MESSAGE";
      payload: { id: number; updates: Partial<SupportMessageWithRelations> };
    }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_SENDING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_HAS_MORE"; payload: boolean }
  | { type: "SET_LOADING_MORE"; payload: boolean }
  | { type: "SET_TYPING"; payload: boolean }
  | { type: "SET_OTHER_TYPING"; payload: boolean }
  | { type: "SET_RETRY_COUNT"; payload: number }
  | { type: "SET_ONLINE"; payload: boolean }
  | { type: "SET_SHOW_LOAD_OLDER"; payload: boolean }
  | { type: "SET_SHOW_SCROLL_BOTTOM"; payload: boolean }
  | { type: "RESET_ERROR" };

const customerChatReducer = (
  state: CustomerChatState,
  action: CustomerChatAction
): CustomerChatState => {
  switch (action.type) {
    case "SET_MESSAGES":
      return { ...state, messages: action.payload };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };
    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.id
            ? { ...msg, ...action.payload.updates }
            : msg
        ),
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_SENDING":
      return { ...state, sending: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, retryCount: 0 };
    case "SET_HAS_MORE":
      return { ...state, hasMore: action.payload };
    case "SET_LOADING_MORE":
      return { ...state, loadingMore: action.payload };
    case "SET_TYPING":
      return { ...state, isTyping: action.payload };
    case "SET_OTHER_TYPING":
      return { ...state, otherTyping: action.payload };
    case "SET_RETRY_COUNT":
      return { ...state, retryCount: action.payload };
    case "SET_ONLINE":
      return { ...state, isOnline: action.payload };
    case "SET_SHOW_LOAD_OLDER":
      return { ...state, showLoadOlder: action.payload };
    case "SET_SHOW_SCROLL_BOTTOM":
      return { ...state, showScrollBottom: action.payload };
    case "RESET_ERROR":
      return { ...state, error: null, retryCount: 0 };
    default:
      return state;
  }
};

const initialState: CustomerChatState = {
  messages: [],
  loading: false,
  sending: false,
  error: null,
  hasMore: false,
  loadingMore: false,
  isTyping: false,
  otherTyping: false,
  retryCount: 0,
  isOnline: true,
  showLoadOlder: false,
  showScrollBottom: false,
};

// Helper Functions
const isOwnMessage = (
  message: SupportMessageWithRelations,
  ticket: SupportTicketWithRelations,
  currentUser?: {
    type: "registered" | "guest";
    id: number | string;
  }
): boolean => {
  // For customer view, messages from support agents are NOT own messages
  if (message.supportAgent) {
    return false; // Support agent message - not own
  }

  // If we have current user info, use it for accurate detection
  if (currentUser) {
    if (currentUser.type === "registered") {
      return message.workspaceUser?.id === currentUser.id;
    } else {
      return message.guestUser?.id === currentUser.id;
    }
  }

  // Fallback to ticket-based detection (legacy)
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
    <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-2 sm:px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
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

// Main Component
const CustomerChatWindow: React.FC<CustomerChatWindowProps> = ({
  ticket,
  className = "",
  onTicketUpdate,
  currentUser,
}) => {
  const [state, dispatch] = useReducer(customerChatReducer, initialState);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const pollingIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const socketRef = useRef<Socket | null>(null);
  const isMountedRef = useRef(true);
  const lastMessageIdRef = useRef<number | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Refs for smart scroll detection (from internal-chat)
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const lastNearBottomAtRef = useRef<number>(0);
  const prevMessagesLenRef = useRef<number>(state.messages.length);
  const prevFirstIdRef = useRef<any>(state.messages[0]?.id);
  const isTypingRef = useRef<boolean>(false);

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

  // Auto-scroll when new message arrives and user is near bottom, or when it's own message
  useEffect(() => {
    const len = state.messages.length;
    const newFirstId = state.messages[0]?.id;
    const appended =
      len > (prevMessagesLenRef.current || 0) &&
      newFirstId === prevFirstIdRef.current; // last changed
    const prepended =
      len > (prevMessagesLenRef.current || 0) &&
      newFirstId !== prevFirstIdRef.current; // older loaded at top

    if (appended) {
      const last = state.messages[len - 1];
      const isOwnMsg = isOwnMessage(last, ticket, currentUser);

      if (isOwnMsg || isNearBottom(220)) {
        // Two RAFs to ensure layout settled
        const id = requestAnimationFrame(() => {
          const id2 = requestAnimationFrame(() => scrollToBottom());
          return () => cancelAnimationFrame(id2);
        });
        return () => cancelAnimationFrame(id);
      }
    }

    // Update trackers after decision
    prevMessagesLenRef.current = len;
    prevFirstIdRef.current = newFirstId;
  }, [state.messages.length, scrollToBottom, ticket, currentUser]);

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
        payload: el.scrollTop <= TOP_THRESHOLD_PX && !!state.hasMore,
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
  }, [state.hasMore, state.messages.length]);

  // Track typing state from MessageInput to suppress near-bottom triggers
  const handleTyping = useCallback((val: boolean) => {
    isTypingRef.current = !!val;
  }, []);

  // Load messages with retry logic
  const loadMessages = useCallback(
    async (page = 1, append = false, retryCount = 0) => {
      if (!isMountedRef.current) return;

      try {
        if (append) {
          dispatch({ type: "SET_LOADING_MORE", payload: true });
        } else {
          dispatch({ type: "SET_LOADING", payload: true });
          dispatch({ type: "RESET_ERROR" });
        }

        console.log(
          `🔍 [CustomerChat] Fetching messages for ticket ${ticket.id}, page ${page}, append: ${append}`
        );

        const response = await fetch(
          `/api/support-chat/public/messages?ticketId=${ticket.id}&page=${page}&limit=50`
        );

        console.log(
          `📡 [CustomerChat] Response status: ${response.status} ${response.statusText}`
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(
          `✅ [CustomerChat] Received ${
            data.messages?.length || 0
          } messages, hasMore: ${data.pagination?.hasMore}`
        );

        if (isMountedRef.current) {
          if (append) {
            // For loading more messages, prepend older messages
            console.log(
              `📝 [CustomerChat] Appending ${
                data.messages?.length || 0
              } older messages to existing ${state.messages.length} messages`
            );
            dispatch({
              type: "SET_MESSAGES",
              payload: [...(data.messages || []), ...state.messages],
            });
          } else {
            // For initial load, show latest messages first
            console.log(
              `📝 [CustomerChat] Setting initial ${
                data.messages?.length || 0
              } messages`
            );
            dispatch({ type: "SET_MESSAGES", payload: data.messages || [] });
            if (data.messages?.length > 0) {
              lastMessageIdRef.current = data.messages[0].id; // First message is newest
              console.log(
                `🔖 [CustomerChat] Set lastMessageId to: ${lastMessageIdRef.current}`
              );
            }
          }

          dispatch({ type: "SET_LOADING", payload: false });
          dispatch({ type: "SET_LOADING_MORE", payload: false });
          dispatch({
            type: "SET_HAS_MORE",
            payload: data.pagination?.hasMore || false,
          });
          dispatch({ type: "SET_RETRY_COUNT", payload: 0 });
        }
      } catch (error) {
        console.error("Error loading messages:", error);

        if (isMountedRef.current) {
          dispatch({ type: "SET_LOADING", payload: false });
          dispatch({ type: "SET_LOADING_MORE", payload: false });

          if (retryCount < MAX_RETRY_ATTEMPTS) {
            dispatch({ type: "SET_RETRY_COUNT", payload: retryCount + 1 });
            retryTimeoutRef.current = setTimeout(() => {
              loadMessages(page, append, retryCount + 1);
            }, RETRY_DELAY * (retryCount + 1));
          } else {
            dispatch({
              type: "SET_ERROR",
              payload: "خطا در بارگذاری پیام‌ها. لطفاً صفحه را رفرش کنید.",
            });
          }
        }
      }
    },
    [ticket.id, state.messages]
  );

  // Load messages without loading state (for polling)
  const loadMessagesSilent = useCallback(async () => {
    if (!isMountedRef.current || !state.isOnline) return;

    try {
      console.log(`[CustomerChat] Polling messages for ticket ${ticket.id}`);
      const response = await fetch(
        `/api/support-chat/public/messages?ticketId=${
          ticket.id
        }&page=1&limit=20&since=${lastMessageIdRef.current || 0}`
      );

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limited - increase polling interval
          clearInterval(pollingIntervalRef.current!);
          pollingIntervalRef.current = setInterval(
            loadMessagesSilent,
            MESSAGE_POLLING_INTERVAL * 2
          );
          return;
        }
        console.log(`[CustomerChat] Polling failed: ${response.status}`);
        return;
      }

      const data = await response.json();
      const newMessages = data.messages || [];
      console.log(
        `[CustomerChat] Polling received ${newMessages.length} messages`
      );

      // Only update if there are new messages
      if (newMessages.length > 0 && isMountedRef.current) {
        const existingIds = new Set(state.messages.map((m) => m.id));
        const uniqueNewMessages = newMessages.filter(
          (m: SupportMessageWithRelations) => !existingIds.has(m.id)
        );

        if (uniqueNewMessages.length > 0) {
          // Add messages one by one to maintain order
          uniqueNewMessages.forEach((msg) => {
            dispatch({ type: "ADD_MESSAGE", payload: msg });
          });
          lastMessageIdRef.current =
            uniqueNewMessages[uniqueNewMessages.length - 1].id;
        }
      }
    } catch (error) {
      console.error("Error loading messages silently:", error);
      // Don't show error for silent polling failures
    }
  }, [ticket.id, state.messages, state.isOnline]);

  // Send message
  const sendMessage = useCallback(
    async (messageBody: string) => {
      if (!messageBody.trim() || state.sending || !socketRef.current) return;

      dispatch({ type: "SET_SENDING", payload: true });

      try {
        // Create temp message for optimistic UI
        const tempId = `temp-${Date.now()}`;
        const tempMessage = {
          id: tempId,
          body: messageBody.trim(),
          messageType: "TEXT",
          createdAt: new Date().toISOString(),
          isOwnMessage: true,
        };

        // Add temp message immediately
        dispatch({ type: "ADD_MESSAGE", payload: tempMessage as any });

        // Send via Socket.IO only
        socketRef.current.emit("support-chat:send-message", {
          ticketId: ticket.id,
          body: messageBody.trim(),
          messageType: "TEXT",
          tempId,
        });

        // Set up fallback timer for HTTP API
        const fallbackTimer = setTimeout(async () => {
          console.warn("⚠️ Socket timeout, falling back to HTTP API");
          try {
            const response = await fetch(`/api/support-chat/public/messages`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ticketId: ticket.id,
                body: messageBody.trim(),
                messageType: "TEXT",
              }),
            });

            if (response.ok) {
              const newMessage = await response.json();
              dispatch({
                type: "UPDATE_MESSAGE",
                payload: { id: tempId as any, updates: newMessage },
              });
              dispatch({ type: "SET_SENDING", payload: false });
            } else {
              throw new Error("HTTP fallback failed");
            }
          } catch (error) {
            console.error("❌ HTTP fallback failed:", error);
            const errorMessage =
              error instanceof Error ? error.message : "خطا در ارسال پیام";
            dispatch({
              type: "SET_MESSAGES",
              payload: state.messages.filter((m) => m.id !== tempId),
            });
            dispatch({ type: "SET_SENDING", payload: false });
            dispatch({ type: "SET_ERROR", payload: errorMessage });
          }
        }, 10000); // 10 second timeout

        // Store timer for cleanup
        (socketRef.current as any).fallbackTimer = fallbackTimer;
      } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage =
          error instanceof Error ? error.message : "خطا در ارسال پیام";
        dispatch({ type: "SET_SENDING", payload: false });
        dispatch({ type: "SET_ERROR", payload: errorMessage });

        // Remove temp message on error
        dispatch({
          type: "SET_MESSAGES",
          payload: state.messages.filter((m) =>
            typeof m.id === "string" ? !m.id.startsWith("temp-") : true
          ),
        });
      }
    },
    [ticket.id, state.sending, state.messages]
  );

  // Handle typing - only send to socket, don't show locally for customer
  const handleTypingIndicator = useCallback(
    (typing: boolean) => {
      // Don't show typing indicator for customer's own typing
      // dispatch({ type: "SET_TYPING", payload: typing });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (typing) {
        // Send typing event via socket
        if (socketRef.current) {
          socketRef.current.emit("support-chat:typing", {
            ticketId: ticket.id,
            isTyping: true,
            userId: "customer",
          });
        }

        typingTimeoutRef.current = setTimeout(() => {
          if (socketRef.current) {
            socketRef.current.emit("support-chat:typing", {
              ticketId: ticket.id,
              isTyping: false,
              userId: "customer",
            });
          }
        }, TYPING_DEBOUNCE_MS);
      }
    },
    [ticket.id]
  );

  // Load more messages
  const loadMoreMessages = useCallback(async () => {
    if (state.loadingMore || !state.hasMore) return;
    const currentPage = Math.ceil(state.messages.length / 20) + 1;
    await loadMessages(currentPage, true);
  }, [state.loadingMore, state.hasMore, state.messages.length, loadMessages]);

  // Retry loading
  const handleRetry = useCallback(() => {
    loadMessages();
  }, [loadMessages]);

  // Load more messages with triple-pass adjustment
  const handleLoadMore = useCallback(async () => {
    if (!loadMoreMessages || !listRef.current) return;

    const el = listRef.current;
    const prevHeight = el.scrollHeight;
    const prevTop = el.scrollTop;
    const prevBehavior = (el.style as any).scrollBehavior;
    (el.style as any).scrollBehavior = "auto";

    await loadMoreMessages();

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
  }, [loadMoreMessages]);

  // Initialize Socket.IO connection
  useEffect(() => {
    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000",
      {
        path: "/api/socket_io",
        transports: ["websocket", "polling"],
      }
    );

    socketRef.current = socket;

    // Join ticket room
    console.log(`[CustomerChat] Joining room for ticket:`, ticket.id);
    socket.emit("support-chat:join", ticket.id);

    // Listen for new messages
    socket.on(
      "support-chat:message-received",
      (message: SupportMessageWithRelations) => {
        console.log(`[CustomerChat] Received message:`, message);
        // Check if message already exists to avoid duplicates
        const exists = state.messages.some((m) => m.id === message.id);
        if (!exists) {
          dispatch({ type: "ADD_MESSAGE", payload: message });
        }
      }
    );

    // Listen for message edited
    socket.on("support-chat:message-edited", (data: any) => {
      console.log(`[CustomerChat] Message edited:`, data);
      if (isMountedRef.current) {
        dispatch({
          type: "UPDATE_MESSAGE",
          payload: {
            id: data.messageId,
            updates: {
              body: data.body,
              isEdited: data.isEdited,
            },
          },
        });
      }
    });

    // Listen for message deleted
    socket.on("support-chat:message-deleted", (data: any) => {
      console.log(`[CustomerChat] Message deleted:`, data);
      if (isMountedRef.current) {
        dispatch({
          type: "UPDATE_MESSAGE",
          payload: {
            id: data.messageId,
            updates: {
              isDeleted: data.isDeleted,
              deletedAt: data.deletedAt,
              body: "پیام حذف شده",
            },
          },
        });
      }
    });

    // Listen for ACK to replace temp messages
    socket.on("support-chat:message-ack", ({ tempId, message }: any) => {
      console.log(`[CustomerChat] ACK received:`, {
        tempId,
        messageId: message?.id,
      });
      if (message?.ticketId === ticket.id) {
        // Clear fallback timer
        if (tempId && (socket as any).fallbackTimer) {
          clearTimeout((socket as any).fallbackTimer);
          (socket as any).fallbackTimer = null;
        }

        if (tempId) {
          // Replace temp message with real message
          dispatch({
            type: "UPDATE_MESSAGE",
            payload: { id: tempId, updates: message },
          });
          dispatch({ type: "SET_SENDING", payload: false });
        } else {
          // Add new message if not already exists
          const exists = state.messages.some((m) => m.id === message.id);
          if (!exists) {
            dispatch({ type: "ADD_MESSAGE", payload: message });
          }
        }
      }
    });

    // Listen for typing indicators - only show for support agents
    socket.on(
      "support-chat:typing",
      (data: { isTyping: boolean; userId: string }) => {
        console.log("⌨️ [CustomerChat] Typing event:", data);
        // Only show typing for support agents, not for customer
        if (data.userId && data.userId !== "customer" && data.userId !== "me") {
          dispatch({ type: "SET_OTHER_TYPING", payload: data.isTyping });
        }
      }
    );

    // Load initial messages
    loadMessages();

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [ticket.id, loadMessages, state.messages]);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  if (state.loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          در حال بارگذاری پیام‌ها...
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <DIcon
            icon="fa-exclamation-triangle"
            classCustom="text-4xl text-red-400 mb-4"
          />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            خطا در بارگذاری
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{state.error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`h-full flex flex-col bg-gray-50 dark:bg-slate-900 w-full max-w-full ${className}`}
    >
      {/* Header */}
      <ChatHeader ticket={ticket} />

      {/* Messages */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 space-y-3 sm:space-y-4 scrollbar-thin relative"
        style={{ overflowAnchor: "none" }}
      >
        {/* Sticky Load More Button */}
        {state.showLoadOlder && (
          <div className="sticky top-0 z-10 flex justify-center">
            <button
              className="mt-1 mb-3 inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-full bg-white/80 backdrop-blur border border-gray-200 shadow hover:bg-white transition"
              onClick={handleLoadMore}
              disabled={state.loadingMore || state.loading}
              title="نمایش پیام‌های قبلی"
            >
              <DIcon icon="fa-arrow-up" />
              <span>پیام‌های قبلی</span>
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-2">
          {state.messages.map((message) => (
            <TicketMessageBubble
              key={message.id}
              message={message}
              isOwnMessage={isOwnMessage(message, ticket, currentUser)}
              isAgent={false}
              showAvatar={true}
              showTime={true}
              onReply={(msg) => {
                // Handle reply - you can implement this based on your needs
                console.log("Reply to message:", msg);
              }}
              onEdit={(msg) => {
                // Handle edit - you can implement this based on your needs
                console.log("Edit message:", msg);
              }}
              onDelete={(msg) => {
                // Handle delete - you can implement this based on your needs
                console.log("Delete message:", msg);
              }}
            />
          ))}
        </div>

        <div ref={messagesEndRef} />

        {/* Floating scroll-to-bottom button */}
        {state.showScrollBottom && (
          <button
            className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 flex items-center justify-center z-30 transition-all duration-200"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              scrollToBottom();
            }}
            title="آخرین پیام"
            aria-label="آخرین پیام"
          >
            <DIcon
              icon="fa-arrow-down"
              cdi={false}
              classCustom="text-white text-sm"
            />
          </button>
        )}
      </div>

      {/* Typing Indicator - only show for support agent typing */}
      {state.otherTyping && (
        <div className="px-2 sm:px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
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
            <span className="hidden sm:inline">پشتیبان در حال تایپ است...</span>
            <span className="sm:hidden">تایپ...</span>
          </div>
        </div>
      )}

      {/* Message Input */}
      <TicketMessageInput
        onSend={sendMessage}
        placeholder="پیام خود را بنویسید..."
        disabled={state.sending || state.loading}
        onTyping={handleTypingIndicator}
        showFileUpload={true}
      />
    </div>
  );
};

// Memoized component for performance
const MemoizedCustomerChatWindow = React.memo(
  CustomerChatWindow,
  (prevProps, nextProps) => {
    return (
      prevProps.ticket?.id === nextProps.ticket?.id &&
      prevProps.ticket?.status === nextProps.ticket?.status &&
      prevProps.currentUser?.id === nextProps.currentUser?.id
    );
  }
);

MemoizedCustomerChatWindow.displayName = "CustomerChatWindow";

export default MemoizedCustomerChatWindow;
export type { CustomerChatWindowProps };
