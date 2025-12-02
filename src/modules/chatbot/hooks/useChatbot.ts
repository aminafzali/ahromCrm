"use client";

import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChatMessage } from "../types";

interface SendMessageResponse {
  sessionId: number;
  reply: string;
  intent: string;
  completed?: boolean;
  quickReplies?: Array<{ label: string; value: string; color?: string }>;
}

interface ChatSession {
  id: number;
  status: string;
  title: string | null;
  lastMessage: string | null;
  lastMessageRole: string | null;
  lastMessageAt: Date;
  messageCount: number;
  createdAt: Date;
  currentIntent: string | null;
}

export function useChatbot(initialSessionId?: number) {
  const { activeWorkspace } = useWorkspace();
  const [sessionId, setSessionId] = useState<number | undefined>(
    initialSessionId
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const appendMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const getAllSessions = useCallback(async () => {
    if (!activeWorkspace?.id) {
      console.log("[useChatbot] getAllSessions skipped - no activeWorkspace");
      return;
    }

    console.log(
      "[useChatbot] getAllSessions called for workspace:",
      activeWorkspace.id
    );
    setLoadingSessions(true);

    try {
      const headers: Record<string, string> = {
        "X-Workspace-Id": activeWorkspace.id.toString(),
      };

      const res = await fetch(`/api/chatbot?list=true&limit=50`, {
        method: "GET",
        headers,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("[useChatbot] getAllSessions error:", errorText);
        throw new Error("خطا در بارگذاری لیست گفتگوها");
      }

      const payload = await res.json();
      const sessionList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : [];
      console.log("[useChatbot] getAllSessions result:", {
        sessionCount: sessionList.length,
        sessionIds: sessionList.map((s: any) => s.id),
      });
      setSessions(sessionList);
    } catch (err) {
      console.error("[useChatbot] Error loading sessions:", err);
    } finally {
      setLoadingSessions(false);
    }
  }, [activeWorkspace?.id]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || loading) return;

      if (!activeWorkspace?.id) {
        const warning =
          "برای استفاده از چت‌بات ابتدا یک ورک‌اسپیس را انتخاب کنید.";
        setError(warning);
        appendMessage({
          id: `bot-error-${Date.now()}`,
          role: "bot",
          content: warning,
          timestamp: new Date(),
        });
        return;
      }

      appendMessage({
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      });

      setLoading(true);
      setError(null);

      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "X-Workspace-Id": activeWorkspace.id.toString(),
        };

        const res = await fetch("/api/chatbot", {
          method: "POST",
          headers,
          body: JSON.stringify({
            message: trimmed,
            sessionId,
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText);
        }

        const data: SendMessageResponse = await res.json();

        if (data.sessionId) {
          setSessionId(data.sessionId);
          console.log("[useChatbot] Session ID received:", data.sessionId);
        }

        console.log("[useChatbot] Received response:", {
          reply: data.reply?.substring(0, 50),
          hasQuickReplies: !!data.quickReplies,
          quickRepliesCount: data.quickReplies?.length || 0,
          quickReplies: data.quickReplies,
        });

        appendMessage({
          id: `bot-${Date.now()}`,
          role: "bot",
          content: data.reply,
          timestamp: new Date(),
          quickReplies: data.quickReplies, // اضافه کردن Quick Reply ها
        });

        // Refresh sessions list after message - با تاخیر بیشتر برای اطمینان از ذخیره شدن در دیتابیس
        setTimeout(() => {
          console.log("[useChatbot] Refreshing sessions list after message...");
          getAllSessions();
        }, 3000);

        return data;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "خطای ناشناخته‌ای رخ داد، لطفا دوباره تلاش کنید.";
        setError(message);
        appendMessage({
          id: `bot-error-${Date.now()}`,
          role: "bot",
          content: "در حال حاضر پاسخگو نیستم، لطفا مجددا تلاش کنید.",
          timestamp: new Date(),
        });
      } finally {
        setLoading(false);
      }
    },
    [appendMessage, sessionId, activeWorkspace?.id, loading, getAllSessions]
  );

  const loadHistory = useCallback(
    async (targetSessionId: number) => {
      if (!activeWorkspace?.id) {
        setError("برای بارگذاری تاریخچه ابتدا یک ورک‌اسپیس را انتخاب کنید.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const headers: Record<string, string> = {
          "X-Workspace-Id": activeWorkspace.id.toString(),
        };

        const res = await fetch(`/api/chatbot?sessionId=${targetSessionId}`, {
          method: "GET",
          headers,
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText);
        }

        const payload = await res.json();
        const session =
          (payload && payload.data) ||
          (Array.isArray(payload) ? payload[0] : payload);

        if (session) {
          // تبدیل پیام‌های session به ChatMessage
          const historyMessages: ChatMessage[] =
            session.messages?.map((msg: any) => ({
              id: `msg-${msg.id}`,
              role: msg.role === "USER" ? "user" : "bot",
              content: msg.content || "",
              timestamp: new Date(msg.createdAt),
            })) || [];

          setMessages(historyMessages);
          setSessionId(targetSessionId);
        } else {
          throw new Error("تاریخچه‌ای برای این گفتگو یافت نشد.");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "خطا در بارگذاری تاریخچه گفتگو";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [activeWorkspace?.id]
  );

  const startNewChat = useCallback(() => {
    setSessionId(undefined);
    setMessages([]);
    setError(null);
  }, []);

  // بارگذاری خودکار تاریخچه وقتی sessionId تغییر می‌کند
  useEffect(() => {
    if (sessionId && sessionId !== initialSessionId) {
      loadHistory(sessionId);
    }
  }, [sessionId, initialSessionId, loadHistory]);

  // بارگذاری لیست session ها در ابتدا
  useEffect(() => {
    getAllSessions();
  }, [getAllSessions]);

  const value = useMemo(
    () => ({
      sessionId,
      messages,
      loading,
      error,
      sendMessage,
      loadHistory,
      getAllSessions,
      startNewChat,
      sessions,
      loadingSessions,
    }),
    [
      sessionId,
      messages,
      loading,
      error,
      sendMessage,
      loadHistory,
      getAllSessions,
      startNewChat,
      sessions,
      loadingSessions,
    ]
  );

  return value;
}
