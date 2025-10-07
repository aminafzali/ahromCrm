"use client";

import { useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";

interface Props {
  workspaceId: number;
  slug: string;
}

type Message = {
  id?: number;
  content: string;
  createdAt?: string;
  sender?: any;
};

export default function SupportChatPublic({ workspaceId, slug }: Props) {
  const { status, data: session } = useSession();
  const { repo, connect, disconnect, join, onMessage, sendMessageRealtime } =
    useChat();

  const roomName = useMemo(() => `Support#${workspaceId}`, [workspaceId]);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [guestMeta, setGuestMeta] = useState<{ ip?: string; country?: string }>(
    {}
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // fetch IP/country for guests
    if (status !== "authenticated") {
      fetch("https://ipapi.co/json/")
        .then((r) => r.json())
        .then((d) => setGuestMeta({ ip: d.ip, country: d.country_name }))
        .catch(() => {});
    }
  }, [status]);

  useEffect(() => {
    let unsub: any;
    (async () => {
      // Ensure room exists
      const found: any = await repo.getAll({
        page: 1,
        limit: 1,
        filters: { name: roomName },
      });
      let id = found?.data?.[0]?.id;
      if (!id) {
        const created: any = await repo.create({ name: roomName });
        id = created?.data?.id || created?.id;
      }
      const numericId = Number(id);
      setRoomId(Number.isFinite(numericId) ? numericId : null);

      // Load history
      if (Number.isFinite(numericId)) {
        const history: any = await repo.messages(numericId as number, {
          page: 1,
          limit: 100,
        });
        setMessages(history?.data || history || []);
      }

      // Realtime join
      connect();
      if (Number.isFinite(numericId)) {
        join(numericId as number);
      }
      unsub = onMessage((msg: any) => {
        setMessages((prev) => [...prev, msg]);
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    })();

    return () => {
      if (unsub) unsub();
      disconnect();
    };
  }, [roomName, repo, connect, disconnect, join, onMessage]);

  const send = async () => {
    if (!input.trim() || !roomId) return;
    let content = input.trim();
    // If guest, prepend meta
    if (status !== "authenticated") {
      const metaText = `[GUEST ip:${guestMeta.ip || "-"} country:${
        guestMeta.country || "-"
      }] `;
      content = `${metaText}${content}`;
    }

    // send realtime (and backend should persist)
    sendMessageRealtime(roomId as number, content);
    setInput("");
  };

  return (
    <div className="max-w-2xl mx-auto my-10 bg-white rounded-xl border">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-bold">پشتیبانی آنلاین</h2>
        {status !== "authenticated" ? (
          <span className="text-xs text-gray-500">
            مهمان | گفتگوی شما برای ادمین‌ها با IP/کشور نمایش داده می‌شود
          </span>
        ) : (
          <span className="text-xs text-gray-500">وارد شده</span>
        )}
      </div>
      <div className="p-4 h-96 overflow-y-auto space-y-3">
        {messages.map((m, idx) => (
          <div key={m.id || idx} className="text-sm bg-gray-50 p-2 rounded">
            {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-4 border-t flex gap-2">
        <input
          className="input input-bordered flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="پیام خود را بنویسید"
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
        />
        <button className="btn btn-primary" onClick={send}>
          ارسال
        </button>
      </div>
    </div>
  );
}
