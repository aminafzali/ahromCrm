"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";

export default function ChatPane({ roomId }: { roomId: number }) {
  const {
    repo,
    connect,
    disconnect,
    join,
    onMessage,
    onTyping,
    sendTyping,
    sendMessageRealtime,
  } = useChat();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    connect();
    join(roomId);
    repo.messages(roomId, { page: 1, limit: 30 }).then((res: any) => {
      setMessages(res?.data || res || []);
    });
    const offMsg = onMessage((msg) => {
      if (Number(msg.roomId) !== Number(roomId)) return;
      setMessages((prev) => [...prev, msg]);
    });
    const offTyping = onTyping(() => {});
    return () => {
      offMsg?.();
      offTyping?.();
      disconnect();
    };
  }, [roomId, connect, disconnect, join, onMessage, onTyping, repo]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  const send = async () => {
    const body = input.trim();
    if (!body) return;
    const tempId = `tmp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, roomId, body, createdAt: new Date().toISOString() },
    ]);
    setInput("");
    sendMessageRealtime(roomId, body, tempId);
  };

  return (
    <div className="flex flex-col h-full">
      <div
        ref={listRef}
        className="flex-1 overflow-auto space-y-2 p-3 bg-white rounded-lg border"
      >
        {messages.map((m) => (
          <div key={m.id} className="p-2 rounded bg-slate-100">
            <div className="text-sm">{m.body}</div>
            <div className="text-xs text-slate-500">
              {new Date(m.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          className="input input-bordered flex-1"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            sendTyping(roomId);
          }}
          placeholder="پیام..."
        />
        <button className="btn btn-primary text-white" onClick={send}>
          ارسال
        </button>
      </div>
    </div>
  );
}
