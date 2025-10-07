"use client";

import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { useCallback, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export type ChatRoom = any;
export type ChatMessage = any;

class ChatRepo extends BaseRepository<any, number> {
  constructor() {
    super("chat");
  }
  messages(roomId: number, params?: any) {
    const q = params ? `?${new URLSearchParams(params).toString()}` : "";
    return this.get(`${this.slug}/rooms/${roomId}/messages${q}`);
  }
  send(roomId: number, data: { body: string; attachments?: any }) {
    return this.post(`${this.slug}/rooms/${roomId}/messages`, data);
  }
}

export function useChat() {
  const repo = useMemo(() => new ChatRepo(), []);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current) return;
    const s = io({ path: "/api/socket_io" });
    socketRef.current = s;
    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));
  }, []);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
  }, []);

  const join = useCallback((roomId: number) => {
    socketRef.current?.emit("chat:join", roomId);
  }, []);

  const onMessage = useCallback((cb: (msg: any) => void) => {
    socketRef.current?.on("chat:message", cb);
    return () => socketRef.current?.off("chat:message", cb);
  }, []);

  const onTyping = useCallback((cb: (data: any) => void) => {
    socketRef.current?.on("chat:typing", cb);
    return () => socketRef.current?.off("chat:typing", cb);
  }, []);

  const sendTyping = useCallback((roomId: number) => {
    socketRef.current?.emit("chat:typing", roomId);
  }, []);

  const sendMessageRealtime = useCallback(
    (roomId: number, body: string, tempId?: string) => {
      socketRef.current?.emit("chat:message", { roomId, body, tempId });
    },
    []
  );

  return {
    repo,
    connected,
    connect,
    disconnect,
    join,
    onMessage,
    onTyping,
    sendTyping,
    sendMessageRealtime,
  };
}
