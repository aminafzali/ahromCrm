"use client";

import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  sender?: {
    name?: string;
    type?: "registered" | "guest" | "support";
    workspaceUserId?: number;
    guestId?: number;
  };
  status?: "sending" | "sent" | "delivered" | "failed";
  replyToId?: number;
  replySnapshot?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
}

// Helper function to validate sender object
export function isValidSender(
  sender: any
): sender is NonNullable<PublicMessage["sender"]> {
  return (
    sender &&
    typeof sender === "object" &&
    typeof sender.type === "string" &&
    ["registered", "guest", "support"].includes(sender.type)
  );
}

export interface UseSupportPublicChatOptions {
  startEndpoint?: string; // endpoint to start or resume chat
  workspaceSlug?: string; // optional hint for backend
}

export function useSupportPublicChat(opts: UseSupportPublicChatOptions = {}) {
  const { activeWorkspace } = useWorkspace();
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

  // Setup all socket event listeners in one place
  const setupSocketEventListeners = useCallback((socket: Socket) => {
    // Join confirmation handler
    const joinedHandler = (data: any) => {
      console.log("✅ [Support Chat] Successfully joined ticket room:", data);
      setJoining(false);
    };
    socket.on("support-chat:joined", joinedHandler);

    // Message handler
    const messageHandler = (msg: any) => {
      console.log("📨 [Support Chat] New message received:", msg);
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
    socket.on("support-chat:message-received", messageHandler);

    // Typing handler
    const typingHandler = (data: { isTyping: boolean; senderId?: string }) => {
      console.log("⌨️ [Support Chat] Typing event:", data);
      if (data.senderId && data.senderId !== "me") {
        setOtherTyping(data.isTyping);
      }
    };
    socket.on("support-chat:typing", typingHandler);

    // Message status handler
    const statusHandler = (data: { messageId: string; status: string }) => {
      console.log("📊 [Support Chat] Message status:", data);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id.toString() === data.messageId
            ? { ...msg, status: data.status as any }
            : msg
        )
      );
    };
    socket.on("support-chat:message-status", statusHandler);

    // Message edit handler
    const editHandler = (data: {
      messageId: number;
      body: string;
      isEdited: boolean;
      editedAt: string;
      editCount: number;
    }) => {
      console.log("✏️ [Support Chat] Message edited:", data);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId
            ? {
                ...msg,
                body: data.body,
                isEdited: data.isEdited,
                editedAt: data.editedAt,
                editCount: data.editCount,
              }
            : msg
        )
      );
    };
    socket.on("support-chat:message-edited", editHandler);

    // Message delete handler
    const deleteHandler = (data: {
      messageId: number;
      isDeleted: boolean;
      deletedAt: string;
    }) => {
      console.log("🗑️ [Support Chat] Message deleted:", data);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId
            ? { ...msg, isDeleted: data.isDeleted, body: "پیام حذف شده" }
            : msg
        )
      );
    };
    socket.on("support-chat:message-deleted", deleteHandler);

    // Return cleanup function
    return () => {
      socket.off("support-chat:joined", joinedHandler);
      socket.off("support-chat:message-received", messageHandler);
      socket.off("support-chat:typing", typingHandler);
      socket.off("support-chat:message-status", statusHandler);
      socket.off("support-chat:message-edited", editHandler);
      socket.off("support-chat:message-deleted", deleteHandler);
    };
  }, []);

  // load persisted guest and ticket ids (workspace info comes from WorkspaceProvider)
  useEffect(() => {
    const gid = localStorage.getItem(STORAGE_KEYS.guestId);
    const tid = localStorage.getItem(STORAGE_KEYS.ticketId);

    if (gid) setGuestId(gid);
    if (tid) setTicketId(Number(tid));

    // Log workspace info for debugging
    if (activeWorkspace) {
      console.log("🔍 [Support Chat] Found workspace info from context:", {
        workspaceUserId: activeWorkspace.id,
        workspaceId: activeWorkspace.workspaceId,
        guestId: gid,
        ticketId: tid,
      });
    }
  }, []); // Remove activeWorkspace dependency to avoid race condition

  // Handle workspace changes separately
  useEffect(() => {
    if (activeWorkspace) {
      console.log(
        "🔄 [Support Chat] Workspace changed, clearing guest session:",
        {
          workspaceUserId: activeWorkspace.id,
          workspaceId: activeWorkspace.workspaceId,
        }
      );
      // Clear guest session when user becomes registered
      setGuestId(null);
      localStorage.removeItem(STORAGE_KEYS.guestId);
    }
  }, [activeWorkspace]);

  // join ticket room
  const join = useCallback((id: number) => {
    console.log("🎯 [Support Chat] join function called:", {
      id,
      connected: socketRef.current?.connected,
    });

    if (!id) {
      console.log("❌ [Support Chat] No ticketId provided to join");
      return;
    }

    if (!socketRef.current?.connected) {
      console.log(
        "⚠️ [Support Chat] Socket not connected, waiting to join room:",
        id
      );
      // Wait for connection and then join
      const checkConnection = () => {
        if (socketRef.current?.connected) {
          console.log("✅ [Support Chat] Socket connected, joining room:", id);
          setJoining(true);
          socketRef.current?.emit("support-chat:join", id);
        } else {
          setTimeout(checkConnection, 100);
        }
      };
      checkConnection();
      return;
    }

    setJoining(true);
    console.log("🔌 [Support Chat] Joining ticket room:", id);
    socketRef.current?.emit("support-chat:join", id);
    // Don't set joining to false immediately, wait for confirmation
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current) return;

    // Get workspace info from context
    const currentWorkspaceUserId = activeWorkspace?.id;
    const currentWorkspaceId = activeWorkspace?.workspaceId;

    console.log("🔌 [Support Chat] Connecting with state:", {
      guestId,
      ticketId,
      workspaceUserId: currentWorkspaceUserId,
      workspaceId: currentWorkspaceId,
      activeWorkspace: activeWorkspace,
    });

    const socket = io({
      path: "/api/socket_io",
      auth: {
        guestId: guestId || undefined,
        ticketId: ticketId || undefined,
        workspaceUserId: currentWorkspaceUserId || undefined,
        workspaceId: currentWorkspaceId || undefined,
      },
    });
    socketRef.current = socket;

    // Set up all event listeners immediately
    setupSocketEventListeners(socket);

    socket.on("connect", () => {
      console.log("✅ [Support Chat] Socket connected");
      setConnected(true);
      // Auto-join room if we have ticketId
      if (ticketId) {
        console.log(
          "🔄 [Support Chat] Auto-joining room after connection:",
          ticketId
        );
        // Small delay to ensure socket is fully ready
        setTimeout(() => {
          join(ticketId);
        }, 100);
      } else {
        // If no ticketId, try to start or resume
        console.log("🔄 [Support Chat] No ticketId, starting new chat...");
        setTimeout(() => {
          startOrResume();
        }, 100);
      }
    });
    socket.on("disconnect", () => {
      console.log("❌ [Support Chat] Socket disconnected");
      setConnected(false);
    });
  }, [guestId, ticketId, activeWorkspace, join]);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setConnected(false);
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

  // Debug handler removed for better performance

  // listen messages - improved with better logging
  // This is handled in the main useEffect above, removing duplicate

  // listen typing indicators - only show for others, not self
  useEffect(() => {
    const typingHandler = (data: { isTyping: boolean; senderId?: string }) => {
      console.log("⌨️ [Support Chat] Typing event:", data, "guestId:", guestId);
      // Only show typing for others, not for current user
      if (
        data.senderId &&
        data.senderId !== guestId &&
        data.senderId !== "me"
      ) {
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
    }) => {
      console.log("✏️ [Support Chat Widget] Message edited:", data);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId
            ? {
                ...msg,
                body: data.body,
                isEdited: data.isEdited,
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
    console.log("🚀 [Support Chat] startOrResume called:", {
      ticketId,
      guestId,
    });

    if (ticketId) {
      // If ticketId exists, ensure we join the room
      console.log("🔄 [Support Chat] Joining existing room:", ticketId);
      join(ticketId);
      return { ticketId, guestId };
    }

    console.log("🆕 [Support Chat] No existing ticket, creating new one...");

    // Collect enhanced client information
    const clientInfo = {
      guestId: guestId || undefined,
      workspaceUserId: activeWorkspace?.id || undefined,
      workspaceId: activeWorkspace?.workspaceId || undefined,
      workspaceSlug: opts.workspaceSlug || activeWorkspace?.workspace?.slug,
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

    console.log("🚀 [Support Chat] Starting chat with info:", clientInfo);

    const res = await fetch(startEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientInfo),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("❌ [Support Chat] Failed to start chat:", errorData);
      throw new Error(
        errorData?.error || `HTTP ${res.status}: Failed to start support chat`
      );
    }

    const data = await res.json();
    console.log("✅ [Support Chat] Chat started successfully:", data);
    if (data.guestId) {
      localStorage.setItem(STORAGE_KEYS.guestId, String(data.guestId));
      setGuestId(String(data.guestId));
    }
    if (data.ticketId) {
      localStorage.setItem(STORAGE_KEYS.ticketId, String(data.ticketId));
      setTicketId(Number(data.ticketId));
      // Join the new room
      console.log("🔄 [Support Chat] Joining new room:", data.ticketId);
      join(Number(data.ticketId));
    }
    // Workspace info comes from WorkspaceProvider, no need to update state

    return {
      ticketId: data.ticketId as number,
      guestId: data.guestId as string,
      guestInfo: data.guestInfo,
    };
  }, [
    ticketId,
    guestId,
    startEndpoint,
    opts.workspaceSlug,
    join,
    activeWorkspace,
  ]);

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

      // Add workspace info for registered users
      if (activeWorkspace?.id && activeWorkspace?.workspaceId) {
        formData.append("workspaceUserId", activeWorkspace.id.toString());
        formData.append("workspaceId", activeWorkspace.workspaceId.toString());
      }

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

  // Edit message
  const editMessage = useCallback(
    async (messageId: number, newBody: string) => {
      if (!ticketId || !socketRef.current) return;

      try {
        console.log(
          "✏️ [Support Chat Widget] Editing message:",
          messageId,
          newBody
        );

        // Send edit request via socket
        socketRef.current.emit("support-chat:message-edit", {
          ticketId,
          messageId,
          newBody,
        });

        // Optimistically update local state
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, body: newBody, isEdited: true }
              : msg
          )
        );
      } catch (error) {
        console.error("Error editing message:", error);
        throw error;
      }
    },
    [ticketId]
  );

  // Delete message
  const deleteMessage = useCallback(
    async (messageId: number) => {
      if (!ticketId || !socketRef.current) return;

      try {
        console.log("🗑️ [Support Chat Widget] Deleting message:", messageId);

        // Send delete request via socket
        socketRef.current.emit("support-chat:message-delete", {
          ticketId,
          messageId,
        });

        // Optimistically update local state
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, isDeleted: true, body: "پیام حذف شده" }
              : msg
          )
        );
      } catch (error) {
        console.error("Error deleting message:", error);
        throw error;
      }
    },
    [ticketId]
  );

  // Determine current user type
  const currentUser = useMemo(() => {
    if (activeWorkspace?.id && activeWorkspace?.workspaceId) {
      return {
        type: "registered" as const,
        id: activeWorkspace.id,
      };
    } else if (guestId) {
      return {
        type: "guest" as const,
        id: guestId,
      };
    }
    return undefined;
  }, [activeWorkspace, guestId]);

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
    // User info
    currentUser,
  };
}
