"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { useWorkspace } from "@/@Client/context/WorkspaceProvider";
import { useEffect, useState } from "react";
import TicketChatWindow from "../components/TicketChatWindow";
import TicketList from "../components/TicketList";
import { useSupportChat } from "../hooks/useSupportChat";
import { SupportTicketStatus } from "../types";

export default function SupportChatTab() {
  console.log("🔄 [Support Chat Tab] Initializing...");
  const { activeWorkspace } = useWorkspace();

  const {
    repo,
    connected,
    connect,
    disconnect,
    joinTicket,
    sendMessageRealtime,
    onMessage,
  } = useSupportChat();

  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<SupportTicketStatus | "ALL">(
    "ALL"
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Load tickets on mount
  useEffect(() => {
    loadTickets();
    connect();

    return () => {
      disconnect();
    };
  }, [filterStatus]);

  // Listen for new messages
  useEffect(() => {
    if (!selectedTicket) return;

    const cleanup = onMessage((message: any) => {
      console.log("📨 New support message received:", message);
      if (message.ticketId === selectedTicket?.id) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [selectedTicket?.id, onMessage]);

  const loadTickets = async () => {
    console.log("🔄 [Support Chat Tab] Loading tickets...");
    setLoading(true);
    try {
      const params: any = {
        page: 1,
        limit: 100,
      };

      if (filterStatus !== "ALL") {
        params.status = filterStatus;
      }

      const response = await repo.getAllTickets(params);

      console.log(
        "✅ [Support Chat Tab] Tickets loaded:",
        response?.data?.length || 0
      );
      setTickets(response?.data || []);
    } catch (error) {
      console.error("❌ [Support Chat Tab] Error loading tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTicket = async (ticket: any) => {
    console.log("🎫 [Support Chat Tab] Ticket selected:", {
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      status: ticket.status,
    });
    setSelectedTicket(ticket);
    setMessagesLoading(true);

    try {
      // Join ticket via Socket.IO
      if (ticket?.id) {
        console.log(
          "🔌 [Support Chat Tab] Joining ticket via Socket.IO:",
          ticket.id
        );
        joinTicket(ticket.id);

        // Load messages
        console.log(
          "📨 [Support Chat Tab] Loading messages for ticket:",
          ticket.id
        );
        const messagesRes: any = await repo.getTicketMessages(ticket.id, {
          page: 1,
          limit: 100,
        });
        console.log(
          "✅ [Support Chat Tab] Messages loaded:",
          messagesRes?.data?.length || 0
        );
        setMessages(messagesRes?.data || []);
      }
    } catch (error) {
      console.error("❌ [Support Chat Tab] Error loading messages:", error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async (
    messageBody: string,
    isInternal: boolean = false
  ) => {
    if (!selectedTicket?.id) {
      console.warn(
        "⚠️ [Support Chat Tab] Cannot send message: No ticket selected"
      );
      return;
    }

    console.log("📤 [Support Chat Tab] Sending message:", {
      ticketId: selectedTicket.id,
      ticketNumber: selectedTicket.ticketNumber,
      messageLength: messageBody.length,
      isInternal,
    });

    try {
      // Optimistic UI update
      const tempId = `temp-${Date.now()}`;
      const tempMessage = {
        id: tempId,
        body: messageBody,
        supportAgentId: 0, // Will be set by server
        isInternal,
        createdAt: new Date().toISOString(),
        isOwnMessage: true,
      };

      console.log("✨ [Support Chat Tab] Adding optimistic message:", tempId);
      setMessages((prev) => [...prev, tempMessage]);

      // Send via Socket.IO (with HTTP fallback handled in hook)
      console.log("🔌 [Support Chat Tab] Sending via Socket.IO...");
      sendMessageRealtime(selectedTicket.id, messageBody, tempId);
      console.log("✅ [Support Chat Tab] Message sent successfully");
    } catch (error) {
      console.error("❌ [Support Chat Tab] Error sending message:", error);
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => !m.id?.startsWith("temp-")));
    }
  };

  // Filter tickets by search query
  const filteredTickets = tickets.filter((ticket) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      ticket.subject?.toLowerCase().includes(lowerQuery) ||
      ticket.ticketNumber?.toLowerCase().includes(lowerQuery) ||
      ticket.workspaceUser?.displayName?.toLowerCase().includes(lowerQuery) ||
      ticket.guestUser?.name?.toLowerCase().includes(lowerQuery)
    );
  });

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-gray-50">
      {/* Sidebar - Ticket List */}
      <div className="w-96 flex-shrink-0 bg-white border-l flex flex-col">
        {/* Filters Header */}
        <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <h2 className="text-lg font-bold mb-3">تیکت‌های پشتیبانی</h2>

          {/* Search */}
          <div className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو..."
              className="w-full pl-10 pr-4 py-2 border border-white/30 bg-white/20 text-white placeholder-white/70 rounded-lg focus:outline-none focus:bg-white/30"
            />
            <DIcon
              icon="fa-search"
              classCustom="absolute left-3 top-1/2 -translate-y-1/2 text-white/70"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full p-2 border border-white/30 bg-white/20 text-white rounded-lg focus:outline-none focus:bg-white/30"
          >
            <option value="ALL">همه</option>
            <option value="OPEN">باز</option>
            <option value="IN_PROGRESS">در حال بررسی</option>
            <option value="WAITING_CUSTOMER">منتظر پاسخ مشتری</option>
            <option value="RESOLVED">حل شده</option>
            <option value="CLOSED">بسته شده</option>
          </select>
        </div>

        {/* Ticket List */}
        <div className="flex-1 overflow-y-auto">
          <TicketList
            tickets={filteredTickets}
            selectedTicketId={selectedTicket?.id}
            onSelectTicket={handleSelectTicket}
            loading={loading}
          />
        </div>

        {/* Stats Footer */}
        <div className="p-3 border-t bg-gray-50 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>تعداد تیکت‌ها:</span>
            <strong>{filteredTickets.length}</strong>
          </div>
        </div>
      </div>

      {/* Main Chat Window */}
      <TicketChatWindow
        ticket={selectedTicket}
        messages={messages}
        currentUserId={activeWorkspace?.id || 0}
        isAgent={true}
        onSendMessage={handleSendMessage}
        loading={messagesLoading}
      />
    </div>
  );
}
