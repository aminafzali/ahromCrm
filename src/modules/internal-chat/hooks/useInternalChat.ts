"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { InternalChatRepository } from "../repo/InternalChatRepository";

export function useInternalChat() {
  const repo = useMemo(() => new InternalChatRepository(), []);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Connect to Socket.IO
  const connect = useCallback(() => {
    if (socketRef.current) return;
    const socket = io({ path: "/api/socket_io" });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Internal Chat connected to Socket.IO");
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ Internal Chat disconnected from Socket.IO");
      setConnected(false);
    });
  }, []);

  // Disconnect from Socket.IO
  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setConnected(false);
  }, []);

  // Join a chat room
  const joinRoom = useCallback((roomId: number) => {
    console.log("📥 Joining room:", roomId);
    socketRef.current?.emit("internal-chat:join", roomId);
  }, []);

  // Leave a chat room
  const leaveRoom = useCallback((roomId: number) => {
    console.log("📤 Leaving room:", roomId);
    socketRef.current?.emit("internal-chat:leave", roomId);
  }, []);

  // Listen for new messages
  const onMessage = useCallback((callback: (message: any) => void) => {
    const handler = (message: any) => {
      console.log(
        "📨 [useInternalChat] Message received from Socket.IO:",
        message
      );
      callback(message);
    };
    socketRef.current?.on("internal-chat:message", handler);
    return () => socketRef.current?.off("internal-chat:message", handler);
  }, []);

  // Send message via Socket.IO (real-time)
  const sendMessageRealtime = useCallback(
    (
      roomId: number,
      body: string,
      tempId?: string,
      senderId?: number,
      replyToId?: number,
      replySnapshot?: any
    ) => {
      console.log("📤 [useInternalChat] Sending message via Socket.IO:", {
        roomId,
        bodyLength: body.length,
        tempId,
        senderId,
        replyToId,
      });
      socketRef.current?.emit("internal-chat:message", {
        roomId,
        body,
        tempId,
        senderId,
        replyToId,
        replySnapshot,
      });
    },
    []
  );

  // Listen for typing indicators
  const onTyping = useCallback((callback: (data: any) => void) => {
    socketRef.current?.on("internal-chat:typing", callback);
    return () => socketRef.current?.off("internal-chat:typing", callback);
  }, []);

  // Send typing indicator
  const sendTyping = useCallback((roomId: number, isTyping: boolean) => {
    socketRef.current?.emit("internal-chat:typing", { roomId, isTyping });
  }, []);

  // Send read receipt
  const sendReadReceipt = useCallback(
    (roomId: number, lastReadMessageId?: number) => {
      console.log(
        "✅ [useInternalChat] Sending read receipt for room:",
        roomId,
        lastReadMessageId
      );
      socketRef.current?.emit("internal-chat:read-receipt", {
        roomId,
        lastReadMessageId,
      });
    },
    []
  );

  // Listen for read receipts
  const onReadReceipt = useCallback((callback: (data: any) => void) => {
    const handler = (data: any) => {
      console.log("✅ [useInternalChat] Read receipt received:", data);
      callback(data);
    };
    socketRef.current?.on("internal-chat:read-receipt", handler);
    return () => socketRef.current?.off("internal-chat:read-receipt", handler);
  }, []);

  // Edit/Delete events
  const emitEditMessage = useCallback(
    (roomId: number, messageId: number, body: string) => {
      console.log("✏️ [useInternalChat] Emit edit", { roomId, messageId });
      socketRef.current?.emit("internal-chat:message-edit", {
        roomId,
        messageId,
        body,
      });
    },
    []
  );

  const emitDeleteMessage = useCallback((roomId: number, messageId: number) => {
    console.log("🗑️ [useInternalChat] Emit delete", { roomId, messageId });
    socketRef.current?.emit("internal-chat:message-delete", {
      roomId,
      messageId,
    });
  }, []);

  const onMessageEdited = useCallback((callback: (data: any) => void) => {
    const handler = (data: any) => {
      console.log("✏️ [useInternalChat] Message edited", data);
      callback(data);
    };
    socketRef.current?.on("internal-chat:message-edited", handler);
    return () =>
      socketRef.current?.off("internal-chat:message-edited", handler);
  }, []);

  const onMessageDeleted = useCallback((callback: (data: any) => void) => {
    const handler = (data: any) => {
      console.log("🗑️ [useInternalChat] Message deleted", data);
      callback(data);
    };
    socketRef.current?.on("internal-chat:message-deleted", handler);
    return () =>
      socketRef.current?.off("internal-chat:message-deleted", handler);
  }, []);

  // Presence: set current user online in internal chat
  const setUserOnline = useCallback((workspaceUserId: number) => {
    console.log("🟢 [useInternalChat] Set user online:", workspaceUserId);
    socketRef.current?.emit("internal-chat:user-status", workspaceUserId);
  }, []);

  // Listen for user online/offline
  const onUserOnline = useCallback((callback: (data: any) => void) => {
    const handler = (data: any) => {
      console.log("🟢 [useInternalChat] User online:", data);
      callback(data);
    };
    socketRef.current?.on("internal-chat:user-online", handler);
    return () => socketRef.current?.off("internal-chat:user-online", handler);
  }, []);

  const onUserOffline = useCallback((callback: (data: any) => void) => {
    const handler = (data: any) => {
      console.log("⚫ [useInternalChat] User offline:", data);
      callback(data);
    };
    socketRef.current?.on("internal-chat:user-offline", handler);
    return () => socketRef.current?.off("internal-chat:user-offline", handler);
  }, []);

  return {
    repo,
    connected,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    onMessage,
    sendMessageRealtime,
    onTyping,
    sendTyping,
    sendReadReceipt,
    onReadReceipt,
    emitEditMessage,
    emitDeleteMessage,
    onMessageEdited,
    onMessageDeleted,
    setUserOnline,
    onUserOnline,
    onUserOffline,
  };
}
