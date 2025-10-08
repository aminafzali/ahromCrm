"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { Button, Input, Modal } from "ndui-ahrom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";

interface SiteChatWidgetProps {
  workspaceId: number;
  className?: string;
}

export default function SiteChatWidget({
  workspaceId,
  className,
}: SiteChatWidgetProps) {
  const { repo, connect, join, onMessage, sendMessageRealtime } = useChat();
  const [open, setOpen] = useState(false);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [roomTitle, setRoomTitle] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supportRoomTitle = useMemo(
    () => `Support#0#${workspaceId}`,
    [workspaceId]
  );

  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const ensureRoom = async () => {
    // try find existing
    const list: any = await repo.getAll({ page: 1, limit: 100 });
    const rooms = list?.data || list || [];
    const existing = rooms.find(
      (r: any) => (r.title || "") === supportRoomTitle
    );
    if (existing) {
      return existing;
    }
    // create new
    const created: any = await repo.create({ name: supportRoomTitle });
    return created?.data || created;
  };

  const openChat = async () => {
    try {
      setOpen(true);
      const room = await ensureRoom();
      if (!room?.id) return;
      setRoomId(room.id);
      setRoomTitle(room.title || "گفتگو");
      join(room.id);
      const res: any = await repo.messages(room.id, { page: 1, limit: 50 });
      const items = (res?.data?.data ?? res?.data ?? res ?? []) as any[];
      setMessages(
        Array.isArray(items)
          ? items
              .slice()
              .sort(
                (a: any, b: any) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              )
          : []
      );
    } catch (e) {
      // noop
    }
  };

  useEffect(() => {
    const unsub = onMessage((msg: any) => {
      if (!roomId || Number(msg?.roomId) !== Number(roomId)) return;
      const safe = {
        ...msg,
        createdAt: msg?.createdAt || new Date().toISOString(),
      };
      setMessages((prev) =>
        [...prev, safe].sort(
          (a: any, b: any) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      );
    });
    return () => {
      if (typeof unsub === "function") {
        unsub();
      }
    };
  }, [roomId, onMessage]);

  const send = async () => {
    if (!text.trim() || !roomId) return;
    const body = text.trim();
    setText("");
    setMessages((prev) => [
      ...prev,
      {
        body,
        createdAt: new Date().toISOString(),
        sender: { displayName: "شما" },
        roomId,
      },
    ]);
    try {
      await repo.send(roomId, { body });
      sendMessageRealtime(roomId, body);
    } catch {}
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={openChat}
        className={`fixed z-[1000] bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 ${
          className || ""
        }`}
        aria-label="chat"
      >
        <DIcon icon="fa-comments" classCustom="text-xl" />
      </button>

      {/* Modal Widget */}
      <Modal isOpen={open} onClose={() => setOpen(false)} size="lg">
        <div className="flex flex-col h-[70vh] w-full md:w-[520px]">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="font-semibold">
              {roomTitle || "گفتگو با پشتیبانی"}
            </div>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              <DIcon icon="fa-xmark" />
            </Button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((m: any, idx: number) => (
              <div key={idx} className="flex">
                <div className="bg-white rounded-lg px-3 py-2 shadow border text-sm">
                  {m.body}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-3 py-3 border-t bg-white">
            <div className="flex items-center gap-2">
              <Input
                name="msg"
                value={text}
                onChange={(e) => setText((e.target as any).value)}
                placeholder="پیام خود را بنویسید"
                className="flex-1 min-w-0"
              />
              <Button
                onClick={send}
                disabled={!roomId || !text.trim()}
                className="bg-blue-600 text-white"
              >
                <DIcon icon="fa-paper-plane" classCustom="text-white" />
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
