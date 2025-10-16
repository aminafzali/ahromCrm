"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { useEffect, useRef, useState } from "react";
import { useSupportChat } from "../hooks/useSupportChat";
import {
  SupportMessageWithRelations,
  SupportTicketWithRelations,
} from "../types";
import StatusBadge from "./StatusBadge";
import TicketMessageBubble from "./TicketMessageBubble";

interface CustomerChatWindowProps {
  ticket: SupportTicketWithRelations;
}

export default function CustomerChatWindow({
  ticket,
}: CustomerChatWindowProps) {
  const { repo, connect, disconnect, joinTicket, leaveTicket, onMessage } =
    useSupportChat();
  const [messages, setMessages] = useState<SupportMessageWithRelations[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    connect();
    joinTicket(ticket.id);

    return () => {
      leaveTicket(ticket.id);
      disconnect();
    };
  }, [ticket.id]);

  useEffect(() => {
    const cleanup = onMessage((message: SupportMessageWithRelations) => {
      if (message.ticketId === ticket.id && !message.isInternal) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [ticket.id, onMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response: any = await repo.getTicketMessages(ticket.id);
      setMessages(response?.data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const message = await repo.sendMessage(ticket.id, {
        body: newMessage.trim(),
      });
      setMessages([...messages, message]);
      setNewMessage("");
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
      alert("خطا در ارسال پیام");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // TODO: Get current user ID from auth context
  const currentUserId = 0;

  return (
    <div className="h-full flex flex-col">
      {/* Ticket Header */}
      <div className="p-3 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
              {ticket.subject}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              #{ticket.ticketNumber}
            </div>
          </div>
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-slate-900">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <DIcon
              icon="fa-spinner fa-spin"
              classCustom="text-3xl text-gray-400"
            />
          </div>
        ) : (
          <>
            {messages
              .filter((msg) => !msg.isInternal)
              .map((message) => (
                <TicketMessageBubble
                  key={message.id}
                  message={message}
                  isOwnMessage={message.workspaceUserId === currentUserId}
                />
              ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-3 border-t dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex items-end gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="پیام خود را بنویسید..."
            rows={2}
            className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:bg-slate-700 dark:text-white"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            type="button"
            className={`p-2.5 rounded-lg transition-all ${
              newMessage.trim() && !sending
                ? "bg-teal-500 text-white hover:bg-teal-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-slate-700"
            }`}
          >
            <DIcon icon="fa-paper-plane" />
          </button>
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center">
          Enter: ارسال | Shift + Enter: خط جدید
        </div>
      </div>
    </div>
  );
}
