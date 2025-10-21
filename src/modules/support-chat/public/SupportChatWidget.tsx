"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import React, { useCallback, useEffect, useReducer, useRef } from "react";
import {
  PublicMessage,
  useSupportPublicChat,
} from "./hooks/useSupportPublicChat";

// Types
interface SupportChatWidgetProps {
  workspaceId?: number;
  currentUser?: {
    id: number | string;
    name?: string;
    email?: string;
  };
  onClose?: () => void;
  className?: string;
}

// Constants
const TYPING_DEBOUNCE_MS = 1000;

// State management with reducer
interface WidgetState {
  isOpen: boolean;
  isMinimized: boolean;
  messages: PublicMessage[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  hasMore: boolean;
  loadingMore: boolean;
  isTyping: boolean;
  otherTyping: boolean;
  showLoadOlder: boolean;
  showScrollBottom: boolean;
  composerValue: string;
  composerMode: "reply" | "edit" | null;
  composerPreview: string | undefined;
  replyToId: number | undefined;
  editMessageId: number | undefined;
}

type WidgetAction =
  | { type: "SET_OPEN"; payload: boolean }
  | { type: "SET_MINIMIZED"; payload: boolean }
  | { type: "SET_MESSAGES"; payload: PublicMessage[] }
  | { type: "ADD_MESSAGE"; payload: PublicMessage }
  | {
      type: "UPDATE_MESSAGE";
      payload: { id: any; updates: Partial<PublicMessage> };
    }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_SENDING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_HAS_MORE"; payload: boolean }
  | { type: "SET_LOADING_MORE"; payload: boolean }
  | { type: "SET_TYPING"; payload: boolean }
  | { type: "SET_OTHER_TYPING"; payload: boolean }
  | { type: "SET_SHOW_LOAD_OLDER"; payload: boolean }
  | { type: "SET_SHOW_SCROLL_BOTTOM"; payload: boolean }
  | { type: "SET_COMPOSER_VALUE"; payload: string }
  | { type: "SET_COMPOSER_MODE"; payload: "reply" | "edit" | null }
  | { type: "SET_COMPOSER_PREVIEW"; payload: string | undefined }
  | { type: "SET_REPLY_TO_ID"; payload: number | undefined }
  | { type: "SET_EDIT_MESSAGE_ID"; payload: number | undefined }
  | { type: "RESET_COMPOSER" };

const widgetReducer = (
  state: WidgetState,
  action: WidgetAction
): WidgetState => {
  switch (action.type) {
    case "SET_OPEN":
      return { ...state, isOpen: action.payload };
    case "SET_MINIMIZED":
      return { ...state, isMinimized: action.payload };
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
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_SENDING":
      return { ...state, sending: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_HAS_MORE":
      return { ...state, hasMore: action.payload };
    case "SET_LOADING_MORE":
      return { ...state, loadingMore: action.payload };
    case "SET_TYPING":
      return { ...state, isTyping: action.payload };
    case "SET_OTHER_TYPING":
      return { ...state, otherTyping: action.payload };
    case "SET_SHOW_LOAD_OLDER":
      return { ...state, showLoadOlder: action.payload };
    case "SET_SHOW_SCROLL_BOTTOM":
      return { ...state, showScrollBottom: action.payload };
    case "SET_COMPOSER_VALUE":
      return { ...state, composerValue: action.payload };
    case "SET_COMPOSER_MODE":
      return { ...state, composerMode: action.payload };
    case "SET_COMPOSER_PREVIEW":
      return { ...state, composerPreview: action.payload };
    case "SET_REPLY_TO_ID":
      return { ...state, replyToId: action.payload };
    case "SET_EDIT_MESSAGE_ID":
      return { ...state, editMessageId: action.payload };
    case "RESET_COMPOSER":
      return {
        ...state,
        composerValue: "",
        composerMode: null,
        composerPreview: undefined,
        replyToId: undefined,
        editMessageId: undefined,
      };
    default:
      return state;
  }
};

const initialState: WidgetState = {
  isOpen: false,
  isMinimized: false,
  messages: [],
  loading: false,
  sending: false,
  error: null,
  hasMore: false,
  loadingMore: false,
  isTyping: false,
  otherTyping: false,
  showLoadOlder: false,
  showScrollBottom: false,
  composerValue: "",
  composerMode: null,
  composerPreview: undefined,
  replyToId: undefined,
  editMessageId: undefined,
};

// Helper Functions
const isOwnMessage = (
  message: PublicMessage,
  currentUser?: { id: number | string }
): boolean => {
  if (!currentUser) return false;

  // Check if message is from current user
  if (message.sender?.workspaceUserId === Number(currentUser.id)) return true;
  if (message.sender?.guestId === currentUser.id) return true;

  return false;
};

const formatMessageTime = (createdAt: string): string => {
  const date = new Date(createdAt);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "همین الان";
  if (diffInMinutes < 60) return `${diffInMinutes} دقیقه پیش`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ساعت پیش`;
  return date.toLocaleDateString("fa-IR");
};

const getMessageStatusIcon = (message: PublicMessage): string => {
  if (message.isDeleted) return "fa-trash";
  if (message.isEdited) return "fa-edit";
  return "fa-check";
};

// Main Component
const SupportChatWidget: React.FC<SupportChatWidgetProps> = ({
  workspaceId = 1,
  currentUser,
  onClose,
  className = "",
}) => {
  const [state, dispatch] = useReducer(widgetReducer, initialState);

  // Refs for smart scroll detection (from internal-chat)
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const lastNearBottomAtRef = useRef<number>(0);
  const prevMessagesLenRef = useRef<number>(0);
  const prevFirstIdRef = useRef<any>(null);
  const isTypingRef = useRef<boolean>(false);
  const isMountedRef = useRef(true);

  // Use the public chat hook
  const {
    messages,
    loadMoreMessages,
    send: sendMessage,
    editMessage,
    deleteMessage,
    startOrResume,
    connected: isConnected,
  } = useSupportPublicChat({});

  // Update state when messages change
  useEffect(() => {
    if (isMountedRef.current) {
      dispatch({ type: "SET_MESSAGES", payload: messages });

      // Initialize smart scroll refs
      if (messages.length > 0) {
        prevMessagesLenRef.current = messages.length;
        prevFirstIdRef.current = messages[0]?.id;
      }
    }
  }, [messages]);

  // Update loading state - using local state for now
  // useEffect(() => {
  //   if (isMountedRef.current) {
  //     dispatch({ type: "SET_LOADING", payload: loading });
  //   }
  // }, [loading]);

  // Update sending state - using local state for now
  // useEffect(() => {
  //   if (isMountedRef.current) {
  //     dispatch({ type: "SET_SENDING", payload: sending });
  //   }
  // }, [sending]);

  // Update error state - using local state for now
  // useEffect(() => {
  //   if (isMountedRef.current) {
  //     dispatch({ type: "SET_ERROR", payload: error });
  //   }
  // }, [error]);

  // Update hasMore state - using local state for now
  // useEffect(() => {
  //   if (isMountedRef.current) {
  //     dispatch({ type: "SET_HAS_MORE", payload: hasMore });
  //   }
  // }, [hasMore]);

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
      const own = isOwnMessage(last, currentUser);
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
  }, [state.messages.length, currentUser, scrollToBottom]);

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

  // Handle widget open/close
  const handleToggle = useCallback(() => {
    if (state.isOpen) {
      dispatch({ type: "SET_MINIMIZED", payload: !state.isMinimized });
    } else {
      dispatch({ type: "SET_OPEN", payload: true });
      dispatch({ type: "SET_MINIMIZED", payload: false });

      // Start or resume chat when opening
      if (currentUser) {
        startOrResume();
      }
    }
  }, [
    state.isOpen,
    state.isMinimized,
    state.messages.length,
    currentUser,
    startOrResume,
  ]);

  const handleClose = useCallback(() => {
    dispatch({ type: "SET_OPEN", payload: false });
    dispatch({ type: "SET_MINIMIZED", payload: false });
    onClose?.();
  }, [onClose]);

  // Handle send message
  const handleSendMessage = useCallback(
    async (messageBody: string) => {
      if (!messageBody.trim() || state.sending) return;

      try {
        // Handle edit mode
        if (state.composerMode === "edit" && state.editMessageId) {
          await editMessage(state.editMessageId, messageBody);
          dispatch({ type: "RESET_COMPOSER" });
          return;
        }

        // Handle reply mode
        let replyToId: number | undefined = undefined;
        if (state.replyToId) {
          replyToId = Number(state.replyToId);
        }

        await sendMessage(messageBody, replyToId);
        dispatch({ type: "RESET_COMPOSER" });
      } catch (error) {
        console.error("Error sending message:", error);
        dispatch({ type: "SET_ERROR", payload: "خطا در ارسال پیام" });
      }
    },
    [
      state.sending,
      state.composerMode,
      state.editMessageId,
      state.replyToId,
      editMessage,
      sendMessage,
    ]
  );

  // Handle reply
  const handleReply = useCallback((message: PublicMessage) => {
    dispatch({ type: "SET_COMPOSER_MODE", payload: "reply" });
    dispatch({
      type: "SET_COMPOSER_PREVIEW",
      payload: message.body?.slice(0, 60),
    });
    dispatch({ type: "SET_REPLY_TO_ID", payload: Number(message.id) });
  }, []);

  // Handle edit
  const handleEdit = useCallback((message: PublicMessage) => {
    dispatch({ type: "SET_COMPOSER_MODE", payload: "edit" });
    dispatch({ type: "SET_COMPOSER_PREVIEW", payload: undefined });
    dispatch({ type: "SET_COMPOSER_VALUE", payload: message.body || "" });
    dispatch({ type: "SET_REPLY_TO_ID", payload: undefined });
    dispatch({ type: "SET_EDIT_MESSAGE_ID", payload: Number(message.id) });
  }, []);

  // Handle delete
  const handleDelete = useCallback(
    async (message: PublicMessage) => {
      try {
        await deleteMessage(Number(message.id));
      } catch (error) {
        console.error("Error deleting message:", error);
        dispatch({ type: "SET_ERROR", payload: "خطا در حذف پیام" });
      }
    },
    [deleteMessage]
  );

  // Handle file upload
  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("workspaceId", workspaceId.toString());

        if (currentUser) {
          formData.append("currentUserId", currentUser.id.toString());
        }

        const response = await fetch("/api/support-chat/public/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload file");
        }

        const result = await response.json();
        const fileMessage = `📎 فایل: ${result.fileName} - ${result.fileUrl}`;
        await sendMessage(fileMessage);
      } catch (error) {
        console.error("File upload failed:", error);
        dispatch({ type: "SET_ERROR", payload: "خطا در آپلود فایل" });
      }
    },
    [workspaceId, currentUser, sendMessage]
  );

  // Play notification sound for support agent messages
  useEffect(() => {
    if (state.messages.length > 0 && !state.isOpen) {
      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage.sender?.type === "support") {
        // Play notification sound
        const audio = new Audio("/sounds/notification.mp3");
        audio.play().catch(() => {
          // Ignore audio play errors
        });
      }
    }
  }, [state.messages.length, state.isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  if (!state.isOpen) {
    return (
      <div className={`fixed bottom-4 left-4 z-50 ${className}`}>
        <button
          onClick={handleToggle}
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center transition-all duration-200"
          title="پشتیبانی آنلاین"
        >
          <DIcon icon="fa-headset" classCustom="text-xl" />
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 left-4 z-50 ${className}`}>
      <div
        className={`bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${
          state.isMinimized ? "w-80 h-16" : "w-96 h-[500px]"
        }`}
      >
        {/* Header */}
        <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DIcon icon="fa-headset" classCustom="text-lg" />
            <span className="font-semibold">پشتیبانی آنلاین</span>
            {isConnected && (
              <div className="flex items-center gap-1 text-green-300">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs">متصل</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                dispatch({ type: "SET_MINIMIZED", payload: !state.isMinimized })
              }
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              title={state.isMinimized ? "باز کردن" : "کوچک کردن"}
            >
              <DIcon
                icon={state.isMinimized ? "fa-chevron-up" : "fa-chevron-down"}
                classCustom="text-sm"
              />
            </button>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              title="بستن"
            >
              <DIcon icon="fa-times" classCustom="text-sm" />
            </button>
          </div>
        </div>

        {!state.isMinimized && (
          <>
            {/* Messages */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 h-[350px]"
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
                {state.messages.map((message) => {
                  const isOwnMsg = isOwnMessage(message, currentUser);

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${
                        isOwnMsg ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                          isOwnMsg
                            ? "bg-blue-500 text-white rounded-br-md"
                            : "bg-gray-200 text-gray-900 rounded-bl-md"
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap break-words">
                          {message.isDeleted ? (
                            <span className="opacity-80">پیام حذف شده</span>
                          ) : (
                            message.body
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-80">
                            {formatMessageTime(message.createdAt)}
                          </span>
                          <div className="flex items-center gap-1">
                            {message.isEdited && (
                              <DIcon
                                icon="fa-edit"
                                classCustom="text-xs opacity-80"
                              />
                            )}
                            <DIcon
                              icon={getMessageStatusIcon(message)}
                              classCustom="text-xs opacity-80"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div ref={messagesEndRef} />

              {/* Floating scroll-to-bottom button */}
              {state.showScrollBottom && (
                <button
                  className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 flex items-center justify-center z-30 transition-all duration-200"
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
                    classCustom="text-white text-xs"
                  />
                </button>
              )}
            </div>

            {/* Typing Indicator */}
            {state.otherTyping && (
              <div className="px-4 py-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
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
                  <span>پشتیبان در حال تایپ است...</span>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              {state.composerMode && (
                <div className="flex items-center justify-between mb-2 text-xs text-gray-600">
                  <div>
                    {state.composerMode === "reply"
                      ? "پاسخ به:"
                      : "ویرایش پیام:"}{" "}
                    {state.composerPreview}
                  </div>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "RESET_COMPOSER" })}
                    className="text-red-600 hover:underline"
                  >
                    لغو
                  </button>
                </div>
              )}
              <div className="flex items-end gap-2" dir="rtl">
                {/* Send button - سمت راست برای فارسی */}
                <button
                  onClick={() => handleSendMessage(state.composerValue)}
                  disabled={!state.composerValue.trim() || state.sending}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="ارسال پیام"
                >
                  <DIcon icon="fa-paper-plane" classCustom="text-sm" />
                </button>

                {/* File upload button */}
                <label className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer transition-colors">
                  <DIcon icon="fa-paperclip" classCustom="text-sm" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,application/pdf,.doc,.docx,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Check file size (5MB limit)
                        if (file.size > 5 * 1024 * 1024) {
                          console.error("File too large");
                          return;
                        }
                        handleFileUpload(file);
                      }
                    }}
                  />
                </label>

                {/* Message input */}
                <textarea
                  value={state.composerValue}
                  onChange={(e) => {
                    dispatch({
                      type: "SET_COMPOSER_VALUE",
                      payload: e.target.value,
                    });
                    handleTyping(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(state.composerValue);
                    }
                  }}
                  placeholder="پیام خود را بنویسید..."
                  className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={1}
                  style={{
                    minHeight: "40px",
                    maxHeight: "120px",
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Memoized component for performance
const MemoizedSupportChatWidget = React.memo(
  SupportChatWidget,
  (prevProps, nextProps) => {
    return (
      prevProps.workspaceId === nextProps.workspaceId &&
      prevProps.currentUser?.id === nextProps.currentUser?.id
    );
  }
);

MemoizedSupportChatWidget.displayName = "SupportChatWidget";

export default MemoizedSupportChatWidget;
export type { SupportChatWidgetProps };
