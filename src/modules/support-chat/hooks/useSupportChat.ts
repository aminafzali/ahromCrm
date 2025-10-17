"use client";

import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
import { useCallback, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SupportChatRepository } from "../repo/SupportChatRepository";

export function useSupportChat() {
  const { activeWorkspace } = useWorkspace();
  const repo = useMemo(() => new SupportChatRepository(), []);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current) return;

    // Get auth data from localStorage or context
    const workspaceUserId =
      localStorage.getItem("workspaceUserId") || activeWorkspace?.id;
    const workspaceId =
      localStorage.getItem("workspaceId") || activeWorkspace?.workspace?.id;

    console.log("🔌 [useSupportChat] Connecting with auth:", {
      workspaceUserId,
      workspaceId,
      activeWorkspace: activeWorkspace,
    });

    const socket = io({
      path: "/api/socket_io",
      auth: {
        workspaceUserId: workspaceUserId
          ? parseInt(String(workspaceUserId))
          : undefined,
        workspaceId: workspaceId ? parseInt(String(workspaceId)) : undefined,
        role: "Admin", // Admin users
      },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Support Chat connected to Socket.IO");
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ Support Chat disconnected from Socket.IO");
      setConnected(false);
    });
  }, []);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setConnected(false);
  }, []);

  // Presence: set user online for support chat
  const setUserOnline = useCallback((workspaceUserId: number) => {
    console.log("🟢 [useSupportChat] Set user online:", workspaceUserId);
    socketRef.current?.emit("support-chat:user-status", workspaceUserId);
  }, []);

  const onUserOnline = useCallback((callback: (data: any) => void) => {
    const handler = (data: any) => {
      console.log("🟢 [useSupportChat] User online:", data);
      callback(data);
    };
    socketRef.current?.on("support-chat:user-online", handler);
    return () => socketRef.current?.off("support-chat:user-online", handler);
  }, []);

  const onUserOffline = useCallback((callback: (data: any) => void) => {
    const handler = (data: any) => {
      console.log("⚫ [useSupportChat] User offline:", data);
      callback(data);
    };
    socketRef.current?.on("support-chat:user-offline", handler);
    return () => socketRef.current?.off("support-chat:user-offline", handler);
  }, []);

  const joinTicket = useCallback((ticketId: number) => {
    console.log("📥 Joining ticket:", ticketId);
    socketRef.current?.emit("support-chat:join", ticketId);
  }, []);

  const leaveTicket = useCallback((ticketId: number) => {
    console.log("📤 Leaving ticket:", ticketId);
    socketRef.current?.emit("support-chat:leave", ticketId);
  }, []);

  const onMessage = useCallback((callback: (message: any) => void) => {
    socketRef.current?.on("support-chat:message", callback);
    return () => socketRef.current?.off("support-chat:message", callback);
  }, []);

  const sendMessageRealtime = useCallback(
    (ticketId: number, body: string, tempId?: string) => {
      socketRef.current?.emit("support-chat:message", {
        ticketId,
        body,
        tempId,
      });
    },
    []
  );

  // Edit/Delete events
  const emitEditMessage = useCallback(
    (ticketId: number, messageId: number, body: string) => {
      console.log("✏️ [useSupportChat] Emit edit", { ticketId, messageId });
      socketRef.current?.emit("support-chat:message-edit", {
        ticketId,
        messageId,
        body,
      });
    },
    []
  );

  const emitDeleteMessage = useCallback(
    (ticketId: number, messageId: number) => {
      console.log("🗑️ [useSupportChat] Emit delete", { ticketId, messageId });
      socketRef.current?.emit("support-chat:message-delete", {
        ticketId,
        messageId,
      });
    },
    []
  );

  const onMessageEdited = useCallback((callback: (data: any) => void) => {
    const handler = (data: any) => {
      console.log("✏️ [useSupportChat] Message edited", data);
      callback(data);
    };
    socketRef.current?.on("support-chat:message-edited", handler);
    return () => socketRef.current?.off("support-chat:message-edited", handler);
  }, []);

  const onMessageDeleted = useCallback((callback: (data: any) => void) => {
    const handler = (data: any) => {
      console.log("🗑️ [useSupportChat] Message deleted", data);
      callback(data);
    };
    socketRef.current?.on("support-chat:message-deleted", handler);
    return () =>
      socketRef.current?.off("support-chat:message-deleted", handler);
  }, []);

  const onTyping = useCallback((callback: (data: any) => void) => {
    socketRef.current?.on("support-chat:typing", callback);
    return () => socketRef.current?.off("support-chat:typing", callback);
  }, []);

  const sendTyping = useCallback((ticketId: number, isTyping: boolean) => {
    socketRef.current?.emit("support-chat:typing", { ticketId, isTyping });
  }, []);

  const onTicketStatusChanged = useCallback((callback: (data: any) => void) => {
    socketRef.current?.on("support-chat:status-changed", callback);
    return () =>
      socketRef.current?.off("support-chat:status-changed", callback);
  }, []);

  const onTicketAssigned = useCallback((callback: (data: any) => void) => {
    socketRef.current?.on("support-chat:assigned", callback);
    return () => socketRef.current?.off("support-chat:assigned", callback);
  }, []);

  return {
    repo,
    connected,
    connect,
    disconnect,
    setUserOnline,
    onUserOnline,
    onUserOffline,
    joinTicket,
    leaveTicket,
    onMessage,
    sendMessageRealtime,
    onTyping,
    sendTyping,
    onTicketStatusChanged,
    onTicketAssigned,
    emitEditMessage,
    emitDeleteMessage,
    onMessageEdited,
    onMessageDeleted,
  };
}
