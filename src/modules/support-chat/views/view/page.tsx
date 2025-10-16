"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TicketChatWindow from "../../components/TicketChatWindow";
import TicketDetailPanel from "../../components/TicketDetailPanel";
import { useSupportChat } from "../../hooks/useSupportChat";
import { SupportChatRepository } from "../../repo/SupportChatRepository";

interface TicketDetailPageProps {
  id: number;
  backUrl?: string;
  isAdmin?: boolean;
}

export default function TicketDetailPage({
  id,
  backUrl = "/dashboard/support-chat",
  isAdmin = false,
}: TicketDetailPageProps) {
  const router = useRouter();
  const repo = new SupportChatRepository();
  const {
    connect,
    disconnect,
    setUserOnline,
    emitEditMessage,
    emitDeleteMessage,
    onMessageEdited,
    onMessageDeleted,
  } = useSupportChat();

  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [autoScrollSignal, setAutoScrollSignal] = useState<number>(0);

  const MESSAGES_PAGE_LIMIT = 50;

  // Load ticket details and presence
  useEffect(() => {
    loadTicket();
    connect();
    setUserOnline?.(0);
    return () => {
      disconnect();
    };
  }, [id]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      console.log("📥 [Ticket Detail] Loading ticket:", id);

      const ticketData = await repo.getTicketById(id);
      setTicket(ticketData);

      // Load latest messages using lastPage logic
      const headRes: any = await repo.getTicketMessages(id, {
        page: 1,
        limit: 1,
      });
      const total = headRes?.total || 0;
      const lastPage = Math.max(1, Math.ceil(total / MESSAGES_PAGE_LIMIT));
      const latestRes: any = await repo.getTicketMessages(id, {
        page: lastPage,
        limit: MESSAGES_PAGE_LIMIT,
      });
      setMessages(latestRes?.data || []);
      setPage(lastPage);
      setHasMore(lastPage > 1);
      setAutoScrollSignal(Date.now());

      console.log("✅ [Ticket Detail] Ticket loaded:", ticketData);
    } catch (error) {
      console.error("❌ [Ticket Detail] Error loading ticket:", error);
      alert("خطا در بارگذاری تیکت");
      router.push(backUrl);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    try {
      const nextPage = page - 1;
      if (nextPage < 1) {
        setHasMore(false);
        return;
      }
      const older = await repo.getTicketMessages(id, {
        page: nextPage,
        limit: MESSAGES_PAGE_LIMIT,
      });
      if (older?.data?.length) {
        setMessages((prev) => [...older.data, ...prev]);
        setPage(nextPage);
        setHasMore(nextPage > 1);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error("❌ [Ticket Detail] Error loading older messages", e);
    }
  };

  const handleSendMessage = async (messageBody: string) => {
    if (!ticket) return;

    try {
      setSending(true);
      console.log("📤 [Ticket Detail] Sending message...");

      const newMessage = await repo.sendMessage(ticket.id, {
        body: messageBody,
      });

      setMessages((prev) => [...prev, newMessage]);
      console.log("✅ [Ticket Detail] Message sent");
    } catch (error) {
      console.error("❌ [Ticket Detail] Error sending message:", error);
      alert("خطا در ارسال پیام");
    } finally {
      setSending(false);
    }
  };

  const handleAssign = async (assignToId: number) => {
    if (!ticket || !isAdmin) return;

    try {
      console.log("👤 [Ticket Detail] Assigning ticket...");
      const updated = await repo.assignTicket(ticket.id, assignToId);
      setTicket(updated);
      console.log("✅ [Ticket Detail] Ticket assigned");
    } catch (error) {
      console.error("❌ [Ticket Detail] Error assigning ticket:", error);
      alert("خطا در تخصیص تیکت");
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!ticket || !isAdmin) return;

    try {
      console.log("📝 [Ticket Detail] Changing status...");
      const updated = await repo.updateTicketStatus(ticket.id, status as any);
      setTicket(updated);
      console.log("✅ [Ticket Detail] Status updated");
    } catch (error) {
      console.error("❌ [Ticket Detail] Error updating status:", error);
      alert("خطا در تغییر وضعیت");
    }
  };

  // Wire edit/delete events from UI
  useEffect(() => {
    const onEdit = async (e: any) => {
      try {
        const { messageId, text } = e.detail || {};
        if (!ticket?.id || !messageId) return;
        const updated = await repo.editMessage(ticket.id, messageId, text);
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, ...updated } : m))
        );
        emitEditMessage?.(ticket.id, messageId, text);
      } catch (err) {
        console.error("❌ [Support Chat Detail] Edit error:", err);
      }
    };
    const onDelete = async (e: any) => {
      try {
        const { messageId } = e.detail || {};
        if (!ticket?.id || !messageId) return;
        const updated = await repo.deleteMessage(ticket.id, messageId);
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, ...updated } : m))
        );
        emitDeleteMessage?.(ticket.id, messageId);
      } catch (err) {
        console.error("❌ [Support Chat Detail] Delete error:", err);
      }
    };
    window.addEventListener("support-chat:edit-request", onEdit as any);
    window.addEventListener("support-chat:delete-request", onDelete as any);
    return () => {
      window.removeEventListener("support-chat:edit-request", onEdit as any);
      window.removeEventListener(
        "support-chat:delete-request",
        onDelete as any
      );
    };
  }, [ticket?.id, repo, emitEditMessage, emitDeleteMessage]);

  // Realtime listeners
  useEffect(() => {
    const offEdited = onMessageEdited?.((data: any) => {
      if (data?.ticketId !== ticket?.id) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.messageId
            ? { ...m, body: data.body, isEdited: true }
            : m
        )
      );
    });
    const offDeleted = onMessageDeleted?.((data: any) => {
      if (data?.ticketId !== ticket?.id) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.messageId ? { ...m, isDeleted: true } : m
        )
      );
    });
    return () => {
      if (offEdited) offEdited();
      if (offDeleted) offDeleted();
    };
  }, [ticket?.id, onMessageEdited, onMessageDeleted]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری تیکت...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">تیکت یافت نشد</p>
          <button
            onClick={() => router.push(backUrl)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            بازگشت
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Chat Window */}
      <div className="flex-1">
        <TicketChatWindow
          ticket={ticket}
          messages={messages}
          onSendMessage={handleSendMessage}
          loading={sending}
          isAgent={isAdmin}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          autoScrollSignal={autoScrollSignal}
        />
      </div>

      {/* Detail Panel (Only for Admin) */}
      {isAdmin && (
        <div className="w-96 border-l">
          <TicketDetailPanel
            ticket={ticket}
            onAssign={handleAssign}
            onChangeStatus={handleStatusChange}
            onClose={() => router.push(backUrl)}
          />
        </div>
      )}
    </div>
  );
}
