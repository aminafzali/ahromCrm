"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import TicketChatWindow from "../components/layout/TicketChatWindow";
import TicketList from "../components/tickets/TicketList";
import { useSupportChat } from "../hooks/useSupportChat";
import { SupportTicketStatus } from "../types";

// State management interfaces
interface SupportChatState {
  tickets: any[];
  selectedTicket: any | null;
  messages: any[];
  loading: boolean;
  messagesLoading: boolean;
  filterStatus: SupportTicketStatus | "ALL";
  searchQuery: string;
  error: string | null;
  composerMode: "reply" | "edit" | null;
  composerValue: string;
  composerPreview: string | undefined;
  replyToId: number | undefined;
  editMessageId: number | undefined;
  onlineUsers: number[];
  unreadCounts: { [key: number]: number };
  autoScrollSignal: number;
  typingUsers: string[];
  isTyping: boolean;
  hasMore: boolean;
  page: number;
  skipAutoScroll: boolean;
}

type SupportChatAction =
  | { type: "SET_TICKETS"; payload: any[] }
  | { type: "SET_SELECTED_TICKET"; payload: any | null }
  | { type: "SET_MESSAGES"; payload: any[] }
  | { type: "ADD_MESSAGE"; payload: any }
  | { type: "UPDATE_MESSAGE"; payload: { id: any; updates: any } }
  | { type: "REMOVE_MESSAGE"; payload: any }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_MESSAGES_LOADING"; payload: boolean }
  | { type: "SET_FILTER_STATUS"; payload: SupportTicketStatus | "ALL" }
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_COMPOSER_MODE"; payload: "reply" | "edit" | null }
  | { type: "SET_COMPOSER_VALUE"; payload: string }
  | { type: "SET_COMPOSER_PREVIEW"; payload: string | undefined }
  | { type: "SET_REPLY_TO_ID"; payload: number | undefined }
  | { type: "SET_EDIT_MESSAGE_ID"; payload: number | undefined }
  | { type: "SET_ONLINE_USERS"; payload: number[] }
  | { type: "ADD_ONLINE_USER"; payload: number }
  | { type: "REMOVE_ONLINE_USER"; payload: number }
  | { type: "SET_UNREAD_COUNTS"; payload: { [key: number]: number } }
  | { type: "SET_AUTO_SCROLL_SIGNAL"; payload: number }
  | { type: "SET_TYPING_USERS"; payload: string[] }
  | { type: "ADD_TYPING_USER"; payload: string }
  | { type: "REMOVE_TYPING_USER"; payload: string }
  | { type: "SET_IS_TYPING"; payload: boolean }
  | { type: "SET_HAS_MORE"; payload: boolean }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_SKIP_AUTO_SCROLL"; payload: boolean }
  | { type: "RESET_COMPOSER" }
  | { type: "CLEAR_ERROR" };

const initialState: SupportChatState = {
  tickets: [],
  selectedTicket: null,
  messages: [],
  loading: false,
  messagesLoading: false,
  filterStatus: "ALL",
  searchQuery: "",
  error: null,
  composerMode: null,
  composerValue: "",
  composerPreview: undefined,
  replyToId: undefined,
  editMessageId: undefined,
  onlineUsers: [],
  unreadCounts: {},
  autoScrollSignal: 0,
  typingUsers: [],
  isTyping: false,
  hasMore: false,
  page: 1,
  skipAutoScroll: false,
};

const supportChatReducer = (
  state: SupportChatState,
  action: SupportChatAction
): SupportChatState => {
  switch (action.type) {
    case "SET_TICKETS":
      return { ...state, tickets: action.payload };
    case "SET_SELECTED_TICKET":
      return { ...state, selectedTicket: action.payload };
    case "SET_MESSAGES":
      return { ...state, messages: action.payload };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };
    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.payload.id ? { ...m, ...action.payload.updates } : m
        ),
      };
    case "REMOVE_MESSAGE":
      return {
        ...state,
        messages: state.messages.filter((m) => m.id !== action.payload),
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_MESSAGES_LOADING":
      return { ...state, messagesLoading: action.payload };
    case "SET_FILTER_STATUS":
      return { ...state, filterStatus: action.payload };
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_COMPOSER_MODE":
      return { ...state, composerMode: action.payload };
    case "SET_COMPOSER_VALUE":
      return { ...state, composerValue: action.payload };
    case "SET_COMPOSER_PREVIEW":
      return { ...state, composerPreview: action.payload };
    case "SET_REPLY_TO_ID":
      return { ...state, replyToId: action.payload };
    case "SET_EDIT_MESSAGE_ID":
      return { ...state, editMessageId: action.payload };
    case "SET_ONLINE_USERS":
      return { ...state, onlineUsers: action.payload };
    case "ADD_ONLINE_USER":
      return {
        ...state,
        onlineUsers: Array.from(
          new Set([...state.onlineUsers, action.payload])
        ),
      };
    case "REMOVE_ONLINE_USER":
      return {
        ...state,
        onlineUsers: state.onlineUsers.filter((id) => id !== action.payload),
      };
    case "SET_UNREAD_COUNTS":
      return { ...state, unreadCounts: action.payload };
    case "SET_AUTO_SCROLL_SIGNAL":
      return { ...state, autoScrollSignal: action.payload };
    case "SET_TYPING_USERS":
      return { ...state, typingUsers: action.payload };
    case "ADD_TYPING_USER":
      return {
        ...state,
        typingUsers: state.typingUsers.includes(action.payload)
          ? state.typingUsers
          : [...state.typingUsers, action.payload],
      };
    case "REMOVE_TYPING_USER":
      return {
        ...state,
        typingUsers: state.typingUsers.filter(
          (name) => name !== action.payload
        ),
      };
    case "SET_IS_TYPING":
      return { ...state, isTyping: action.payload };
    case "SET_HAS_MORE":
      return { ...state, hasMore: action.payload };
    case "SET_PAGE":
      return { ...state, page: action.payload };
    case "SET_SKIP_AUTO_SCROLL":
      return { ...state, skipAutoScroll: action.payload };
    case "RESET_COMPOSER":
      return {
        ...state,
        composerMode: null,
        composerValue: "",
        composerPreview: undefined,
        replyToId: undefined,
        editMessageId: undefined,
      };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
};

const SupportChatTab = () => {
  console.log("🔄 [Support Chat Tab] Initializing...");
  const { activeWorkspace } = useWorkspace();

  const {
    repo,
    connected,
    connect,
    disconnect,
    joinRoom: joinTicket,
    sendMessage: sendMessageRealtime,
    onMessage,
    onAck,
    onTyping,
    onMessageEdited,
    onMessageDeleted,
    sendTyping,
    onUserOnline,
    onUserOffline,
    setUserOnline,
  } = useSupportChat();

  // Use reducer for state management
  const [state, dispatch] = useReducer(supportChatReducer, initialState);
  const pendingAckTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesRef = useRef(state.messages);
  const unreadCountsRef = useRef(state.unreadCounts);

  // Update refs when state changes
  useEffect(() => {
    messagesRef.current = state.messages;
    unreadCountsRef.current = state.unreadCounts;
  }, [state.messages, state.unreadCounts]);

  // Load tickets when filter changes
  useEffect(() => {
    if (!isMountedRef.current) return;
    loadTickets();
  }, [state.filterStatus, repo]);

  // Initialize connection and listeners on mount
  useEffect(() => {
    if (!isMountedRef.current) return;

    connect();

    // Set user online
    if (activeWorkspace?.id) {
      setUserOnline(activeWorkspace.id);
    }

    // Listen for online/offline users
    const offOnline = onUserOnline((e) => {
      if (isMountedRef.current) {
        dispatch({ type: "ADD_ONLINE_USER", payload: e.userId });
      }
    });
    const offOffline = onUserOffline((e) => {
      if (isMountedRef.current) {
        dispatch({ type: "REMOVE_ONLINE_USER", payload: e.userId });
      }
    });

    return () => {
      offOnline?.();
      offOffline?.();
      disconnect();
      // Clear all pending timers
      pendingAckTimersRef.current.forEach((timer) => clearTimeout(timer));
      pendingAckTimersRef.current.clear();
    };
  }, [
    activeWorkspace?.id,
    setUserOnline,
    onUserOnline,
    onUserOffline,
    connect,
    disconnect,
  ]);

  // Load unread counts for tickets
  const loadUnreadCounts = useCallback(
    async (ticketsList: any[]) => {
      if (!isMountedRef.current) return;

      try {
        const counts: { [key: number]: number } = {};

        const tasks = ticketsList.map((ticket) =>
          repo
            .getUnreadCount(ticket.id)
            .then((count) => ({ id: ticket.id, count }))
            .catch(() => ({ id: ticket.id, count: 0 }))
        );

        const results = await Promise.allSettled(tasks);
        results.forEach((r) => {
          if (r.status === "fulfilled") {
            const { id, count } = r.value as any;
            if (count > 0) counts[id] = count;
          }
        });

        if (isMountedRef.current) {
          dispatch({ type: "SET_UNREAD_COUNTS", payload: counts });
        }
      } catch (error) {
        console.error("Error loading unread counts:", error);
      }
    },
    [repo]
  );

  // Listen for new messages
  useEffect(() => {
    if (!state.selectedTicket || !isMountedRef.current) return;

    const cleanup = onMessage((message: any) => {
      console.log("📨 New support message received:", message);
      if (
        message.ticketId === state.selectedTicket?.id &&
        isMountedRef.current
      ) {
        dispatch({ type: "ADD_MESSAGE", payload: message });
      }
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [state.selectedTicket?.id, onMessage]);

  // Listen for ACK to replace temp messages
  useEffect(() => {
    if (!state.selectedTicket || !isMountedRef.current) return;

    const cleanup = onAck(({ tempId, message }: any) => {
      console.log("✅ ACK received:", { tempId, messageId: message?.id });
      if (
        message?.ticketId === state.selectedTicket?.id &&
        isMountedRef.current
      ) {
        // Clear fallback timer
        if (tempId && pendingAckTimersRef.current.has(tempId)) {
          clearTimeout(pendingAckTimersRef.current.get(tempId)!);
          pendingAckTimersRef.current.delete(tempId);
        }

        if (tempId) {
          // Replace temp message with real message
          dispatch({
            type: "UPDATE_MESSAGE",
            payload: { id: tempId, updates: message },
          });
        } else {
          // Add new message if not already exists
          dispatch({ type: "ADD_MESSAGE", payload: message });
        }
      }
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [state.selectedTicket?.id, onAck]);

  // Listen for message edited
  useEffect(() => {
    if (!state.selectedTicket || !isMountedRef.current) return;

    const cleanup = onMessageEdited((data: any) => {
      console.log("✏️ Message edited:", data);
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

    return () => {
      if (cleanup) cleanup();
    };
  }, [onMessageEdited]);

  // Listen for message deleted
  useEffect(() => {
    if (!state.selectedTicket || !isMountedRef.current) return;

    const cleanup = onMessageDeleted((data: any) => {
      console.log("🗑️ Message deleted:", data);
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

    return () => {
      if (cleanup) cleanup();
    };
  }, [onMessageDeleted]);

  // Listen for typing indicators
  useEffect(() => {
    if (!state.selectedTicket || !isMountedRef.current) return;

    const cleanup = onTyping((data: any) => {
      if (data.ticketId === state.selectedTicket?.id && isMountedRef.current) {
        if (data.isTyping) {
          dispatch({ type: "ADD_TYPING_USER", payload: data.userName });
        } else {
          dispatch({ type: "REMOVE_TYPING_USER", payload: data.userName });
        }
      }
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [state.selectedTicket?.id, onTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const loadTickets = useCallback(async () => {
    if (!isMountedRef.current) return;

    console.log("🔄 [Support Chat Tab] Loading tickets...");
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "CLEAR_ERROR" });

    try {
      const params: any = {
        page: 1,
        limit: 100,
      };

      if (state.filterStatus !== "ALL") {
        params.status = state.filterStatus;
      }

      const response = await repo.getAllTickets(params);

      console.log(
        "✅ [Support Chat Tab] Tickets loaded:",
        response?.data?.length || 0
      );

      if (isMountedRef.current) {
        dispatch({ type: "SET_TICKETS", payload: response?.data || [] });
        // Load unread counts
        await loadUnreadCounts(response?.data || []);
      }
    } catch (error) {
      console.error("❌ [Support Chat Tab] Error loading tickets:", error);
      const errorMessage =
        error instanceof Error ? error.message : "خطا در بارگذاری تیکت‌ها";
      if (isMountedRef.current) {
        dispatch({ type: "SET_ERROR", payload: errorMessage });
      }
    } finally {
      if (isMountedRef.current) {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    }
  }, [state.filterStatus, repo]);

  const handleSelectTicket = useCallback(
    async (ticket: any) => {
      if (!isMountedRef.current) return;

      console.log("🎫 [Support Chat Tab] Ticket selected:", {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        status: ticket.status,
      });

      dispatch({ type: "SET_SELECTED_TICKET", payload: ticket });
      dispatch({ type: "SET_MESSAGES_LOADING", payload: true });

      try {
        // Join ticket via Socket.IO
        if (ticket?.id) {
          console.log(
            "🔌 [Support Chat Tab] Joining ticket via Socket.IO:",
            ticket.id
          );
          joinTicket(ticket.id);

          // Load messages
          console.log(
            "📨 [Support Chat Tab] Loading messages for ticket:",
            ticket.id
          );
          const messagesRes: any = await repo.getTicketMessages(ticket.id, {
            page: 1,
            limit: 100,
          });
          console.log(
            "✅ [Support Chat Tab] Messages loaded:",
            messagesRes?.data?.length || 0,
            "pagination:",
            messagesRes?.pagination
          );

          if (isMountedRef.current) {
            // Show latest messages first
            const messages = messagesRes?.data || [];
            dispatch({
              type: "SET_MESSAGES",
              payload: messages,
            });
            dispatch({ type: "SET_PAGE", payload: 1 });
            dispatch({
              type: "SET_HAS_MORE",
              payload: messagesRes?.pagination?.hasMore || false,
            });

            // Mark messages as read
            await markMessagesAsRead(ticket.id);

            // Auto scroll to bottom
            setTimeout(
              () =>
                dispatch({
                  type: "SET_AUTO_SCROLL_SIGNAL",
                  payload: Date.now(),
                }),
              0
            );
          }
        }
      } catch (error) {
        console.error("❌ [Support Chat Tab] Error loading messages:", error);
        const errorMessage =
          error instanceof Error ? error.message : "خطا در بارگذاری پیام‌ها";
        if (isMountedRef.current) {
          dispatch({ type: "SET_ERROR", payload: errorMessage });
        }
      } finally {
        if (isMountedRef.current) {
          dispatch({ type: "SET_MESSAGES_LOADING", payload: false });
        }
      }
    },
    [joinTicket, repo]
  );

  const handleSendMessage = useCallback(
    async (messageBody: string, isInternal: boolean = false) => {
      if (!state.selectedTicket?.id || !isMountedRef.current) {
        console.warn(
          "⚠️ [Support Chat Tab] Cannot send message: No ticket selected"
        );
        return;
      }

      console.log("📤 [Support Chat Tab] Sending message:", {
        ticketId: state.selectedTicket.id,
        ticketNumber: state.selectedTicket.ticketNumber,
        messageLength: messageBody.length,
        isInternal,
      });

      try {
        // Handle edit mode
        if (state.composerMode === "edit" && state.editMessageId) {
          const updated = await repo.editMessage(
            state.selectedTicket.id,
            state.editMessageId,
            { body: messageBody }
          );
          if (isMountedRef.current) {
            dispatch({
              type: "UPDATE_MESSAGE",
              payload: { id: state.editMessageId, updates: updated },
            });
            dispatch({ type: "RESET_COMPOSER" });
          }
          return;
        }

        // Handle reply mode
        let replySnapshot: any = undefined;
        if (state.replyToId) {
          const ref = messagesRef.current.find((m) => m.id === state.replyToId);
          if (ref) {
            replySnapshot = {
              id: ref.id,
              body: ref.body,
              senderId: ref.senderId,
              sender: { displayName: ref.sender?.displayName },
              isDeleted: !!ref.isDeleted,
            };
          }
        }

        // Optimistic UI update
        const tempId = `temp-${Date.now()}`;
        const tempMessage = {
          id: tempId,
          body: messageBody,
          supportAgentId: 0, // Will be set by server
          isInternal,
          createdAt: new Date().toISOString(),
          isOwnMessage: true,
          replyToId: state.replyToId,
          replyTo: replySnapshot,
        };

        console.log("✨ [Support Chat Tab] Adding optimistic message:", tempId);
        if (isMountedRef.current) {
          dispatch({ type: "ADD_MESSAGE", payload: tempMessage });
        }

        // Set up fallback timer for ACK
        const fallbackTimer = setTimeout(() => {
          console.warn(
            "⚠️ [Support Chat Tab] ACK timeout, falling back to HTTP"
          );
          pendingAckTimersRef.current.delete(tempId);

          // Fallback to HTTP API
          repo
            .sendMessage(state.selectedTicket.id, messageBody, isInternal)
            .then((realMessage) => {
              console.log(
                "✅ [Support Chat Tab] HTTP fallback successful:",
                realMessage
              );
              if (isMountedRef.current) {
                dispatch({
                  type: "UPDATE_MESSAGE",
                  payload: { id: tempId, updates: realMessage },
                });
              }
            })
            .catch((error) => {
              console.error(
                "❌ [Support Chat Tab] HTTP fallback failed:",
                error
              );
              if (isMountedRef.current) {
                dispatch({ type: "REMOVE_MESSAGE", payload: tempId });
              }
            });
        }, 5000); // 5 second timeout

        pendingAckTimersRef.current.set(tempId, fallbackTimer);

        // Send via Socket.IO (with HTTP fallback handled in hook)
        console.log("🔌 [Support Chat Tab] Sending via Socket.IO...");
        sendMessageRealtime({
          ticketId: state.selectedTicket.id,
          body: messageBody,
          tempId,
          replyToId: state.replyToId,
          replySnapshot,
        });
        console.log("✅ [Support Chat Tab] Message sent successfully");

        // Reset composer
        if (isMountedRef.current) {
          dispatch({ type: "RESET_COMPOSER" });
        }
      } catch (error) {
        console.error("❌ [Support Chat Tab] Error sending message:", error);
        // Remove temp message on error
        if (isMountedRef.current) {
          dispatch({ type: "REMOVE_MESSAGE", payload: "temp-" });
        }

        // Show user-friendly error message
        const errorMessage =
          error instanceof Error ? error.message : "خطا در ارسال پیام";
        console.error("❌ [Support Chat Tab] User error:", errorMessage);
        if (isMountedRef.current) {
          dispatch({ type: "SET_ERROR", payload: errorMessage });
        }
      }
    },
    [
      state.selectedTicket?.id,
      state.composerMode,
      state.editMessageId,
      state.replyToId,
      repo,
      sendMessageRealtime,
    ]
  );

  // Handlers for reply/edit/delete
  const handleReply = useCallback((msg: any) => {
    if (!isMountedRef.current) return;
    dispatch({ type: "SET_COMPOSER_MODE", payload: "reply" });
    dispatch({ type: "SET_COMPOSER_PREVIEW", payload: msg.body?.slice(0, 60) });
    dispatch({ type: "SET_REPLY_TO_ID", payload: msg.id });
  }, []);

  const handleEdit = useCallback(async (msg: any) => {
    if (!isMountedRef.current) return;
    dispatch({ type: "SET_COMPOSER_MODE", payload: "edit" });
    dispatch({ type: "SET_COMPOSER_PREVIEW", payload: undefined });
    dispatch({ type: "SET_COMPOSER_VALUE", payload: msg.body || "" });
    dispatch({ type: "SET_REPLY_TO_ID", payload: undefined });
    dispatch({ type: "SET_EDIT_MESSAGE_ID", payload: msg.id });
  }, []);

  const handleDelete = useCallback(
    async (msg: any) => {
      if (!isMountedRef.current || !state.selectedTicket?.id) return;

      try {
        await repo.deleteMessage(state.selectedTicket.id, msg.id);
        if (isMountedRef.current) {
          dispatch({
            type: "UPDATE_MESSAGE",
            payload: { id: msg.id, updates: { isDeleted: true } },
          });
        }
      } catch (error) {
        console.error("Error deleting message:", error);
        if (isMountedRef.current) {
          dispatch({ type: "SET_ERROR", payload: "خطا در حذف پیام" });
        }
      }
    },
    [repo, state.selectedTicket?.id]
  );

  // Handle typing
  const handleTyping = useCallback(
    (typing: boolean) => {
      if (!isMountedRef.current) return;
      dispatch({ type: "SET_IS_TYPING", payload: typing });
      if (state.selectedTicket?.id) {
        sendTyping(state.selectedTicket.id, typing);
      }
    },
    [state.selectedTicket?.id, sendTyping]
  );

  // Load more messages
  const loadMoreMessages = useCallback(async () => {
    if (!state.selectedTicket?.id || !state.hasMore || !isMountedRef.current)
      return;

    dispatch({ type: "SET_SKIP_AUTO_SCROLL", payload: true });
    try {
      const nextPage = state.page - 1;
      const response = await repo.getTicketMessages(state.selectedTicket.id, {
        page: nextPage,
        limit: 50,
      });

      if (response?.data?.length && isMountedRef.current) {
        console.log(
          `📝 [Support Chat Tab] Loading more messages: ${response.data.length} new messages, page ${nextPage}`
        );
        // Prepend older messages to the beginning
        dispatch({
          type: "SET_MESSAGES",
          payload: [...response.data, ...messagesRef.current],
        });
        dispatch({ type: "SET_PAGE", payload: nextPage });
        dispatch({ type: "SET_HAS_MORE", payload: nextPage > 1 });
      } else if (isMountedRef.current) {
        console.log(
          `❌ [Support Chat Tab] No more messages to load, page ${nextPage}`
        );
        dispatch({ type: "SET_HAS_MORE", payload: false });
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      if (isMountedRef.current) {
        setTimeout(
          () => dispatch({ type: "SET_SKIP_AUTO_SCROLL", payload: false }),
          0
        );
      }
    }
  }, [state.selectedTicket?.id, state.hasMore, state.page, repo]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(
    async (ticketId: number) => {
      if (!isMountedRef.current) return;

      try {
        if ((window as any).__sc_read_lock__ === ticketId) return;
        (window as any).__sc_read_lock__ = ticketId;

        const result = await repo.markAsRead(ticketId);
        if (result?.marked && result.marked > 0) {
          // You can add socket emit here if needed
        }

        setTimeout(() => {
          if ((window as any).__sc_read_lock__ === ticketId) {
            (window as any).__sc_read_lock__ = undefined;
          }
        }, 1500);

        // Update unread counts
        if (isMountedRef.current) {
          dispatch({
            type: "SET_UNREAD_COUNTS",
            payload: { ...unreadCountsRef.current, [ticketId]: 0 },
          });
        }
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    },
    [repo]
  );

  // Memoized filtered tickets
  const filteredTickets = useMemo(() => {
    let tickets = state.tickets;

    // Filter by search query
    if (state.searchQuery) {
      const lowerQuery = state.searchQuery.toLowerCase();
      tickets = tickets.filter((ticket) => {
        return (
          ticket.subject?.toLowerCase().includes(lowerQuery) ||
          ticket.ticketNumber?.toLowerCase().includes(lowerQuery) ||
          ticket.workspaceUser?.displayName
            ?.toLowerCase()
            .includes(lowerQuery) ||
          ticket.guestUser?.name?.toLowerCase().includes(lowerQuery)
        );
      });
    }

    // Sort by unread count first, then by last activity
    return tickets.sort((a, b) => {
      const aUnread = state.unreadCounts[a.id] || 0;
      const bUnread = state.unreadCounts[b.id] || 0;

      // First sort by unread count (descending)
      if (aUnread !== bUnread) {
        return bUnread - aUnread;
      }

      // Then sort by last activity (descending)
      const aTime = new Date(a.lastActivityAt || a.createdAt).getTime();
      const bTime = new Date(b.lastActivityAt || b.createdAt).getTime();
      return bTime - aTime;
    });
  }, [state.tickets, state.searchQuery, state.unreadCounts]);

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-row bg-gray-50">
      {/* Sidebar - Ticket List */}
      <div className="w-80 xl:w-96 flex-shrink-0 bg-white border-l flex flex-col">
        {/* Filters Header */}
        <div className="p-3 sm:p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <h2 className="text-base sm:text-lg font-bold mb-3">
            تیکت‌های پشتیبانی
          </h2>

          {/* Search */}
          <div className="relative mb-3">
            <input
              type="text"
              value={state.searchQuery}
              onChange={(e) =>
                dispatch({ type: "SET_SEARCH_QUERY", payload: e.target.value })
              }
              placeholder="جستجو..."
              className="w-full pl-10 pr-4 py-2 border border-white/30 bg-white/20 text-white placeholder-white/70 rounded-lg focus:outline-none focus:bg-white/30"
            />
            <DIcon
              icon="fa-search"
              classCustom="absolute left-3 top-1/2 -translate-y-1/2 text-white/70"
            />
          </div>

          {/* Status Filter */}
          <select
            value={state.filterStatus}
            onChange={(e) =>
              dispatch({
                type: "SET_FILTER_STATUS",
                payload: e.target.value as any,
              })
            }
            className="w-full p-2 border border-white/30 bg-white/20 text-white rounded-lg focus:outline-none focus:bg-white/30"
          >
            <option value="ALL">همه</option>
            <option value="OPEN">باز</option>
            <option value="IN_PROGRESS">در حال بررسی</option>
            <option value="WAITING_CUSTOMER">منتظر پاسخ مشتری</option>
            <option value="RESOLVED">حل شده</option>
            <option value="CLOSED">بسته شده</option>
          </select>
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg mb-3">
            <div className="flex items-center gap-2">
              <DIcon
                icon="fa-exclamation-triangle"
                classCustom="text-red-500"
              />
              <span>{state.error}</span>
              <button
                onClick={() => dispatch({ type: "CLEAR_ERROR" })}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <DIcon icon="fa-times" />
              </button>
            </div>
          </div>
        )}

        {/* Ticket List */}
        <div className="flex-1 overflow-y-auto">
          <TicketList
            tickets={filteredTickets}
            selectedTicketId={state.selectedTicket?.id}
            onSelectTicket={handleSelectTicket}
            loading={state.loading}
            unreadCounts={state.unreadCounts}
          />
        </div>

        {/* Stats Footer */}
        <div className="p-3 border-t bg-gray-50 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>تعداد تیکت‌ها:</span>
            <strong>{filteredTickets.length}</strong>
          </div>
        </div>
      </div>

      {/* Main Chat Window - Full Width */}
      <div className="flex-1 flex flex-col">
        <TicketChatWindow
          ticket={state.selectedTicket}
          messages={state.messages}
          currentUserId={activeWorkspace?.id || 0}
          isAgent={true}
          onSendMessage={handleSendMessage}
          onReplyMessage={handleReply}
          onEditMessage={handleEdit}
          onDeleteMessage={handleDelete}
          loading={state.messagesLoading}
          composerValue={state.composerValue}
          composerMode={state.composerMode}
          composerPreview={state.composerPreview}
          onComposerChange={(value: string) => {
            dispatch({ type: "SET_COMPOSER_VALUE", payload: value });
          }}
          onComposerCancel={() => dispatch({ type: "RESET_COMPOSER" })}
          onTyping={handleTyping}
          typingUsers={state.typingUsers}
          onlineUsers={state.onlineUsers}
          hasMore={state.hasMore}
          onLoadMore={loadMoreMessages}
          autoScrollSignal={state.autoScrollSignal}
        />
      </div>
    </div>
  );
};

// Memoized component for performance
const MemoizedSupportChatTab = React.memo(
  SupportChatTab,
  (prevProps, nextProps) => {
    // Since this component doesn't take props, it should always re-render when needed
    return false;
  }
);

MemoizedSupportChatTab.displayName = "SupportChatTab";

export default MemoizedSupportChatTab;
