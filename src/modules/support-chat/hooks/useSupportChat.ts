/**
 * Support Chat Hook
 * Custom hook for managing support chat functionality
 */

"use client";

import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
import { useCallback, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SUPPORT_SOCKET_EVENTS } from "../constants";
import { SupportChatRepository } from "../repo/SupportChatRepository";
import {
  SupportAssignPayload,
  SupportMessage,
  SupportMessageAckPayload,
  SupportMessageDeletePayload,
  SupportMessageEditPayload,
  SupportMessagePayload,
  SupportStatusChangePayload,
  SupportTypingPayload,
  UseSupportChatReturn,
} from "../types";

export function useSupportChat(): UseSupportChatReturn {
  const repo = useMemo(() => new SupportChatRepository(), []);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const { activeWorkspace } = useWorkspace?.() || ({} as any);

  // Connect to Socket.IO
  const connect = useCallback(() => {
    if (socketRef.current) return;

    const auth = activeWorkspace?.id
      ? {
          workspaceUserId: activeWorkspace.id,
          workspaceId: activeWorkspace.workspace?.id,
          role: activeWorkspace.role?.name,
        }
      : undefined;

    const socket = io({ path: "/api/socket_io", auth });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Support Chat connected to Socket.IO");
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ Support Chat disconnected from Socket.IO");
      setConnected(false);
    });
  }, [
    activeWorkspace?.id,
    activeWorkspace?.workspace?.id,
    activeWorkspace?.role?.name,
  ]);

  // Disconnect from Socket.IO
  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setConnected(false);
  }, []);

  // Join a support ticket room
  const joinRoom = useCallback((ticketId: number) => {
    console.log("📥 Joining support ticket:", ticketId);
    socketRef.current?.emit(SUPPORT_SOCKET_EVENTS.JOIN, ticketId);
  }, []);

  // Leave a support ticket room
  const leaveRoom = useCallback((ticketId: number) => {
    console.log("📤 Leaving support ticket:", ticketId);
    socketRef.current?.emit(SUPPORT_SOCKET_EVENTS.LEAVE, ticketId);
  }, []);

  // Send message via Socket.IO (real-time)
  const sendMessage = useCallback((payload: SupportMessagePayload) => {
    console.log("📤 [useSupportChat] Sending message via Socket.IO:", {
      ticketId: payload.ticketId,
      bodyLength: payload.body?.length,
      tempId: payload.tempId,
    });
    socketRef.current?.emit(SUPPORT_SOCKET_EVENTS.MESSAGE, payload);
  }, []);

  // Edit message
  const editMessage = useCallback((payload: SupportMessageEditPayload) => {
    console.log("✏️ [useSupportChat] Editing message:", payload);
    socketRef.current?.emit(SUPPORT_SOCKET_EVENTS.MESSAGE_EDIT, payload);
  }, []);

  // Delete message
  const deleteMessage = useCallback((payload: SupportMessageDeletePayload) => {
    console.log("🗑️ [useSupportChat] Deleting message:", payload);
    socketRef.current?.emit(SUPPORT_SOCKET_EVENTS.MESSAGE_DELETE, payload);
  }, []);

  // Send typing indicator
  const sendTyping = useCallback((ticketId: number, isTyping: boolean) => {
    socketRef.current?.emit(SUPPORT_SOCKET_EVENTS.TYPING, {
      ticketId,
      isTyping,
    });
  }, []);

  // Event Listeners
  const onMessage = useCallback(
    (callback: (message: SupportMessage) => void) => {
      const handler = (message: SupportMessage) => {
        console.log("📨 [useSupportChat] Message received:", message);
        callback(message);
      };
      socketRef.current?.on(SUPPORT_SOCKET_EVENTS.MESSAGE_RECEIVED, handler);
      return () => {
        socketRef.current?.off(SUPPORT_SOCKET_EVENTS.MESSAGE_RECEIVED, handler);
      };
    },
    []
  );

  const onAck = useCallback(
    (callback: (data: SupportMessageAckPayload) => void) => {
      const handler = (data: SupportMessageAckPayload) => {
        console.log("✅ [useSupportChat] ACK received:", data);
        callback(data);
      };
      socketRef.current?.on(SUPPORT_SOCKET_EVENTS.MESSAGE_ACK, handler);
      return () => {
        socketRef.current?.off(SUPPORT_SOCKET_EVENTS.MESSAGE_ACK, handler);
      };
    },
    []
  );

  const onTyping = useCallback(
    (callback: (data: SupportTypingPayload) => void) => {
      const handler = (data: SupportTypingPayload) => {
        console.log("⌨️ [useSupportChat] Typing received:", data);
        callback(data);
      };
      socketRef.current?.on(SUPPORT_SOCKET_EVENTS.TYPING_RECEIVED, handler);
      return () => {
        socketRef.current?.off(SUPPORT_SOCKET_EVENTS.TYPING_RECEIVED, handler);
      };
    },
    []
  );

  const onMessageEdited = useCallback((callback: (data: any) => void) => {
    const handler = (data: any) => {
      console.log("✏️ [useSupportChat] Message edited:", data);
      callback(data);
    };
    socketRef.current?.on(SUPPORT_SOCKET_EVENTS.MESSAGE_EDITED, handler);
    return () => {
      socketRef.current?.off(SUPPORT_SOCKET_EVENTS.MESSAGE_EDITED, handler);
    };
  }, []);

  const onMessageDeleted = useCallback((callback: (data: any) => void) => {
    const handler = (data: any) => {
      console.log("🗑️ [useSupportChat] Message deleted:", data);
      callback(data);
    };
    socketRef.current?.on(SUPPORT_SOCKET_EVENTS.MESSAGE_DELETED, handler);
    return () => {
      socketRef.current?.off(SUPPORT_SOCKET_EVENTS.MESSAGE_DELETED, handler);
    };
  }, []);

  const onStatusChanged = useCallback(
    (callback: (data: SupportStatusChangePayload) => void) => {
      const handler = (data: SupportStatusChangePayload) => {
        console.log("🔄 [useSupportChat] Status changed:", data);
        callback(data);
      };
      socketRef.current?.on(SUPPORT_SOCKET_EVENTS.STATUS_CHANGED, handler);
      return () => {
        socketRef.current?.off(SUPPORT_SOCKET_EVENTS.STATUS_CHANGED, handler);
      };
    },
    []
  );

  const onAssigned = useCallback(
    (callback: (data: SupportAssignPayload) => void) => {
      const handler = (data: SupportAssignPayload) => {
        console.log("👤 [useSupportChat] Ticket assigned:", data);
        callback(data);
      };
      socketRef.current?.on(SUPPORT_SOCKET_EVENTS.ASSIGNED, handler);
      return () => {
        socketRef.current?.off(SUPPORT_SOCKET_EVENTS.ASSIGNED, handler);
      };
    },
    []
  );

  const onError = useCallback((callback: (error: any) => void) => {
    const handler = (error: any) => {
      console.error("❌ [useSupportChat] Error received:", error);
      callback(error);
    };
    socketRef.current?.on(SUPPORT_SOCKET_EVENTS.ERROR, handler);
    return () => {
      socketRef.current?.off(SUPPORT_SOCKET_EVENTS.ERROR, handler);
    };
  }, []);

  return {
    // Connection
    connected,
    connect,
    disconnect,

    // Room Management
    joinRoom,
    leaveRoom,

    // Messaging
    sendMessage,
    editMessage,
    deleteMessage,

    // Event Listeners
    onMessage,
    onAck,
    onTyping,
    onMessageEdited,
    onMessageDeleted,
    onStatusChanged,
    onAssigned,
    onError,

    // Typing
    sendTyping,

    // Additional methods for compatibility
    joinTicket: joinRoom,
    leaveTicket: leaveRoom,
    sendMessageRealtime: sendMessage,
    setUserOnline: () => {}, // Placeholder
    emitEditMessage: (ticketId: number, messageId: number, text: string) => {
      editMessage({ ticketId, messageId, newBody: text });
    },
    emitDeleteMessage: (ticketId: number, messageId: number) => {
      deleteMessage({ ticketId, messageId });
    },

    // Repository
    repo,
  };
}
