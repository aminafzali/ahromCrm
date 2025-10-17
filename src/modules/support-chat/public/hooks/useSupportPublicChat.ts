"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const STORAGE_KEYS = {
  guestId: "ahrom_support_guestId",
  ticketId: "ahrom_support_ticketId",
};

export interface PublicMessage {
  id: number | string;
  body: string;
  isInternal?: boolean;
  createdAt: string;
  sender?: { name?: string };
  status?: "sending" | "sent" | "delivered" | "failed";
  replyToId?: number;
  replySnapshot?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
}

export interface UseSupportPublicChatOptions {
  startEndpoint?: string; // endpoint to start or resume chat
  workspaceSlug?: string; // optional hint for backend
}

export function useSupportPublicChat(opts: UseSupportPublicChatOptions = {}) {
  const startEndpoint = opts.startEndpoint || "/api/support-chat/public/start";
  const [ticketId, setTicketId] = useState<number | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [messages, setMessages] = useState<PublicMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [joining, setJoining] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [lastReset, setLastReset] = useState(Date.now());
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const socketRef = useRef<Socket | null>(null);
  const pendingTempRef = useRef<Map<string, number>>(new Map());
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // load persisted ids
  useEffect(() => {
    const gid = localStorage.getItem(STORAGE_KEYS.guestId);
    const tid = localStorage.getItem(STORAGE_KEYS.ticketId);
    if (gid) setGuestId(gid);
    if (tid) setTicketId(Number(tid));
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current) return;

    // Get auth data from localStorage
    const gid = localStorage.getItem(STORAGE_KEYS.guestId);
    const tid = localStorage.getItem(STORAGE_KEYS.ticketId);

    const socket = io({
      path: "/api/socket_io",
      auth: {
        guestId: gid ? parseInt(gid) : undefined,
        ticketId: tid ? parseInt(tid) : undefined,
      },
    });
    socketRef.current = socket;
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
  }, []);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setConnected(false);
  }, []);

  // join ticket room
  const join = useCallback((id: number) => {
    if (!id || !socketRef.current?.connected) return;
    setJoining(true);
    console.log("🔌 [Support Chat] Joining ticket room:", id);
    socketRef.current?.emit("support-chat:join", id);
    // Don't set joining to false immediately, wait for confirmation
  }, []);

  // listen for join confirmation
  useEffect(() => {
    const joinedHandler = (data: any) => {
      console.log("✅ [Support Chat] Successfully joined ticket room:", data);
      setJoining(false);
    };
    socketRef.current?.on("support-chat:joined", joinedHandler);
    return () => {
      socketRef.current?.off("support-chat:joined", joinedHandler);
    };
  }, []);

  // listen messages
  useEffect(() => {
    const handler = (msg: any) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        // replace temp if matches by body+createdAt proximity
        if (typeof msg.id === "number") {
          for (const [tempId, ts] of pendingTempRef.current.entries()) {
            if (Date.now() - ts < 15000) {
              const idx = prev.findIndex((m) => m.id === tempId);
              if (idx !== -1) {
                const clone = prev.slice();
                clone[idx] = { ...msg, status: "delivered" };
                pendingTempRef.current.delete(tempId);
                return clone;
              }
            }
          }
        }
        return [...prev, { ...msg, status: "delivered" }];
      });
    };
    socketRef.current?.on("support-chat:message", handler);
    return () => {
      socketRef.current?.off("support-chat:message", handler);
    };
  }, []);

  // listen typing indicators
  useEffect(() => {
    const typingHandler = (data: { isTyping: boolean; senderId?: string }) => {
      if (data.senderId !== guestId) {
        setOtherTyping(data.isTyping);
      }
    };
    socketRef.current?.on("support-chat:typing", typingHandler);
    return () => {
      socketRef.current?.off("support-chat:typing", typingHandler);
    };
  }, [guestId]);

  // listen message status updates
  useEffect(() => {
    const statusHandler = (data: { messageId: string; status: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId
            ? { ...msg, status: data.status as any }
            : msg
        )
      );
    };
    socketRef.current?.on("support-chat:message-status", statusHandler);
    return () => {
      socketRef.current?.off("support-chat:message-status", statusHandler);
    };
  }, []);

  // listen message edit updates
  useEffect(() => {
    const editHandler = (data: {
      messageId: number;
      body: string;
      isEdited: boolean;
      editedAt: string;
      editCount: number;
    }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId
            ? {
                ...msg,
                body: data.body,
                isEdited: data.isEdited,
                editCount: data.editCount,
              }
            : msg
        )
      );
    };
    socketRef.current?.on("support-chat:message-edited", editHandler);
    return () => {
      socketRef.current?.off("support-chat:message-edited", editHandler);
    };
  }, []);

  // listen message delete updates
  useEffect(() => {
    const deleteHandler = (data: {
      messageId: number;
      isDeleted: boolean;
      deletedAt: string;
    }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId
            ? { ...msg, isDeleted: data.isDeleted, body: "پیام حذف شده" }
            : msg
        )
      );
    };
    socketRef.current?.on("support-chat:message-deleted", deleteHandler);
    return () => {
      socketRef.current?.off("support-chat:message-deleted", deleteHandler);
    };
  }, []);

  const startOrResume = useCallback(async () => {
    if (ticketId) return { ticketId, guestId };

    // Collect enhanced client information
    const clientInfo = {
      guestId: guestId || undefined,
      workspaceSlug: opts.workspaceSlug,
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      locale: typeof navigator !== "undefined" ? navigator.language : undefined,
      screenResolution:
        typeof screen !== "undefined"
          ? `${screen.width}x${screen.height}`
          : undefined,
      timezone:
        typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone
          : undefined,
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
      utmSource:
        typeof URLSearchParams !== "undefined"
          ? new URLSearchParams(window.location.search).get("utm_source")
          : undefined,
      utmMedium:
        typeof URLSearchParams !== "undefined"
          ? new URLSearchParams(window.location.search).get("utm_medium")
          : undefined,
      utmCampaign:
        typeof URLSearchParams !== "undefined"
          ? new URLSearchParams(window.location.search).get("utm_campaign")
          : undefined,
    };

    const res = await fetch(startEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientInfo),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to start support chat");
    if (data.guestId) {
      localStorage.setItem(STORAGE_KEYS.guestId, String(data.guestId));
      setGuestId(String(data.guestId));
    }
    if (data.ticketId) {
      localStorage.setItem(STORAGE_KEYS.ticketId, String(data.ticketId));
      setTicketId(Number(data.ticketId));
      // Wait for socket to be connected before joining
      if (socketRef.current?.connected) {
        join(Number(data.ticketId));
      } else {
        // Wait for connection
        const checkConnection = () => {
          if (socketRef.current?.connected) {
            join(Number(data.ticketId));
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      }
    }
    return {
      ticketId: data.ticketId as number,
      guestId: data.guestId as string,
      guestInfo: data.guestInfo,
    };
  }, [ticketId, guestId, startEndpoint, opts.workspaceSlug, join]);

  // Rate limiting check
  const canSendMessage = useCallback(() => {
    const now = Date.now();
    if (now - lastReset > 60000) {
      // Reset every minute
      setMessageCount(0);
      setLastReset(now);
    }
    return messageCount < 10; // Max 10 messages per minute
  }, [messageCount, lastReset]);

  // Message validation
  const validateMessage = useCallback((body: string) => {
    if (!body.trim()) return "پیام نمی‌تواند خالی باشد";
    if (body.length > 1000) return "پیام خیلی طولانی است";
    if (body.length < 2) return "پیام خیلی کوتاه است";
    return null;
  }, []);

  // Typing indicator functions
  const startTyping = useCallback(() => {
    if (!ticketId || isTyping) return;
    setIsTyping(true);
    socketRef.current?.emit("support-chat:typing", {
      ticketId,
      isTyping: true,
    });
  }, [ticketId, isTyping]);

  const stopTyping = useCallback(() => {
    if (!ticketId || !isTyping) return;
    setIsTyping(false);
    socketRef.current?.emit("support-chat:typing", {
      ticketId,
      isTyping: false,
    });
  }, [ticketId, isTyping]);

  const handleTyping = useCallback(
    (isTyping: boolean) => {
      if (isTyping) {
        startTyping();
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          stopTyping();
        }, 3000);
      } else {
        stopTyping();
      }
    },
    [startTyping, stopTyping]
  );

  const send = useCallback(
    async (body: string, replyToId?: number, replySnapshot?: string) => {
      if (!ticketId || !body?.trim()) return;

      // Validate message
      const validationError = validateMessage(body);
      if (validationError) {
        throw new Error(validationError);
      }

      // Check rate limiting
      if (!canSendMessage()) {
        throw new Error("تعداد پیام‌های ارسالی زیاد است. لطفاً کمی صبر کنید.");
      }

      const tempId = `temp-${Date.now()}`;
      const temp: PublicMessage = {
        id: tempId,
        body,
        createdAt: new Date().toISOString(),
        status: "sending",
        replyToId,
        replySnapshot,
      };

      setMessages((prev) => [...prev, temp]);
      pendingTempRef.current.set(tempId, Date.now());
      setMessageCount((prev) => prev + 1);

      // Stop typing
      stopTyping();

      console.log("🚀 [Support Chat] Sending message", {
        ticketId,
        body: body.substring(0, 50) + "...",
        tempId,
        replyToId,
        replySnapshot,
        socketConnected: socketRef.current?.connected,
      });

      socketRef.current?.emit("support-chat:message", {
        ticketId,
        body,
        tempId,
        replyToId,
        replySnapshot,
      });
    },
    [ticketId, validateMessage, canSendMessage, stopTyping]
  );

  // Edit message
  const editMessage = useCallback(
    async (messageId: number, newBody: string) => {
      if (!ticketId || !newBody?.trim()) return;

      // Validate message
      const validationError = validateMessage(newBody);
      if (validationError) {
        throw new Error(validationError);
      }

      socketRef.current?.emit("support-chat:message-edit", {
        ticketId,
        messageId,
        body: newBody,
      });
    },
    [ticketId, validateMessage]
  );

  // Delete message
  const deleteMessage = useCallback(
    async (messageId: number) => {
      if (!ticketId) return;

      socketRef.current?.emit("support-chat:message-delete", {
        ticketId,
        messageId,
      });
    },
    [ticketId]
  );

  // Upload file
  const uploadFile = useCallback(
    async (file: File) => {
      if (!ticketId) throw new Error("No ticket ID available");

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error("File size too large. Maximum 10MB allowed.");
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error("File type not allowed");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("ticketId", ticketId.toString());

      const response = await fetch("/api/support-chat/public/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload file");
      }

      const result = await response.json();
      return result;
    },
    [ticketId]
  );

  // Load more messages
  const loadMoreMessages = useCallback(async () => {
    if (!ticketId || loadingMore || !hasMoreMessages) return;

    setLoadingMore(true);
    try {
      const response = await fetch(
        `/api/support-chat/public/messages?ticketId=${ticketId}&page=${
          currentPage + 1
        }&limit=20`
      );

      if (!response.ok) {
        throw new Error("Failed to load messages");
      }

      const data = await response.json();

      if (data.messages.length > 0) {
        setMessages((prev) => [...data.messages, ...prev]);
        setCurrentPage((prev) => prev + 1);
        setHasMoreMessages(data.pagination.hasMore);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [ticketId, loadingMore, hasMoreMessages, currentPage]);

  return {
    connect,
    disconnect,
    connected,
    joining,
    messages,
    ticketId,
    guestId,
    startOrResume,
    join,
    send,
    // New features
    isTyping,
    otherTyping,
    handleTyping,
    canSendMessage,
    validateMessage,
    editMessage,
    deleteMessage,
    uploadFile,
    // Pagination
    hasMoreMessages,
    loadingMore,
    loadMoreMessages,
  };
}
