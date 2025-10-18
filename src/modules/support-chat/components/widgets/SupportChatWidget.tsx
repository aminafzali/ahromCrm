"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import React, { useCallback, useEffect, useState } from "react";
import { SupportTicketWithRelations } from "../../types";
import NewTicketForm from "../forms/NewTicketForm";
import TicketCard from "../tickets/TicketCard";

// Types
interface SupportChatWidgetProps {
  workspaceSlug?: string;
  className?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  theme?: "light" | "dark" | "auto";
}

interface WidgetState {
  isOpen: boolean;
  view: "tickets" | "new" | "chat";
  selectedTicket: SupportTicketWithRelations | null;
  tickets: SupportTicketWithRelations[];
  loading: boolean;
}

// Constants
const POSITION_CLASSES = {
  "bottom-right": "bottom-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "top-right": "top-4 right-4",
  "top-left": "top-4 left-4",
} as const;

const THEME_CLASSES = {
  light: "bg-white text-gray-900 border-gray-200",
  dark: "bg-slate-800 text-white border-slate-700",
  auto: "bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700",
} as const;

// Helper Functions
const loadMyTickets = async (): Promise<SupportTicketWithRelations[]> => {
  try {
    const response = await fetch("/api/support-chat/my-tickets");
    if (!response.ok) throw new Error("Failed to load tickets");
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error loading tickets:", error);
    return [];
  }
};

// Sub-components
const WidgetToggle: React.FC<{
  isOpen: boolean;
  onClick: () => void;
  theme: keyof typeof THEME_CLASSES;
  position: keyof typeof POSITION_CLASSES;
}> = ({ isOpen, onClick, theme, position }) => (
  <button
    onClick={onClick}
    className={`
      fixed ${POSITION_CLASSES[position]} z-50
      w-14 h-14 rounded-full shadow-lg transition-all duration-300
      ${isOpen ? "scale-90" : "scale-100 hover:scale-110"}
      ${THEME_CLASSES[theme]} border-2
      flex items-center justify-center
      hover:shadow-xl active:scale-95
    `}
    title={isOpen ? "بستن چت" : "باز کردن چت"}
  >
    <DIcon icon={isOpen ? "fa-times" : "fa-comments"} classCustom="text-xl" />
  </button>
);

const WidgetHeader: React.FC<{
  title: string;
  onBack?: () => void;
  onClose: () => void;
  theme: keyof typeof THEME_CLASSES;
}> = ({ title, onBack, onClose, theme }) => (
  <div
    className={`px-4 py-3 border-b ${
      THEME_CLASSES[theme].split(" ")[2]
    } flex items-center justify-between`}
  >
    <div className="flex items-center gap-3">
      {onBack && (
        <button
          onClick={onBack}
          className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
        >
          <DIcon icon="fa-arrow-right" classCustom="text-sm" />
        </button>
      )}
      <h3 className="font-semibold text-lg">{title}</h3>
    </div>
    <button
      onClick={onClose}
      className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
    >
      <DIcon icon="fa-times" classCustom="text-sm" />
    </button>
  </div>
);

const TicketsList: React.FC<{
  tickets: SupportTicketWithRelations[];
  loading: boolean;
  onSelectTicket: (ticket: SupportTicketWithRelations) => void;
  onCreateNew: () => void;
  theme: keyof typeof THEME_CLASSES;
}> = ({ tickets, loading, onSelectTicket, onCreateNew, theme }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          در حال بارگذاری...
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <DIcon icon="fa-inbox" classCustom="text-4xl text-gray-400 mb-4" />
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          هیچ تیکتی ندارید
        </h4>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          برای شروع، یک تیکت جدید ایجاد کنید
        </p>
        <button
          onClick={onCreateNew}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          ایجاد تیکت جدید
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          onClick={() => onSelectTicket(ticket)}
          variant="compact"
        />
      ))}
      <button
        onClick={onCreateNew}
        className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
      >
        <DIcon icon="fa-plus" classCustom="ml-2" />
        ایجاد تیکت جدید
      </button>
    </div>
  );
};

const ChatView: React.FC<{
  ticket: SupportTicketWithRelations;
  onBack: () => void;
  theme: keyof typeof THEME_CLASSES;
}> = ({ ticket, onBack, theme }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load messages for the selected ticket
    const loadMessages = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/support-chat/tickets/${ticket.id}/messages`
        );
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [ticket.id]);

  return (
    <div className="flex flex-col h-full">
      <WidgetHeader
        title={`تیکت #${ticket.ticketNumber}`}
        onBack={onBack}
        onClose={() => {}} // Will be handled by parent
        theme={theme}
      />

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              در حال بارگذاری پیام‌ها...
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.isOwnMessage
                    ? "bg-blue-500 text-white ml-auto max-w-[80%]"
                    : "bg-gray-100 dark:bg-slate-700 mr-auto max-w-[80%]"
                }`}
              >
                <p className="text-sm">{message.body}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.createdAt).toLocaleTimeString("fa-IR")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Component
const SupportChatWidget: React.FC<SupportChatWidgetProps> = ({
  workspaceSlug,
  className = "",
  position = "bottom-right",
  theme = "auto",
}) => {
  const [state, setState] = useState<WidgetState>({
    isOpen: false,
    view: "tickets",
    selectedTicket: null,
    tickets: [],
    loading: false,
  });

  const loadTickets = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const tickets = await loadMyTickets();
      setState((prev) => ({ ...prev, tickets, loading: false }));
    } catch (error) {
      console.error("Error loading tickets:", error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const handleToggle = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: !prev.isOpen,
      view: !prev.isOpen ? "tickets" : prev.view,
    }));
  }, []);

  const handleClose = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
      view: "tickets",
      selectedTicket: null,
    }));
  }, []);

  const handleBack = useCallback(() => {
    setState((prev) => ({
      ...prev,
      view: "tickets",
      selectedTicket: null,
    }));
  }, []);

  const handleSelectTicket = useCallback(
    (ticket: SupportTicketWithRelations) => {
      setState((prev) => ({
        ...prev,
        selectedTicket: ticket,
        view: "chat",
      }));
    },
    []
  );

  const handleNewTicket = useCallback(() => {
    setState((prev) => ({
      ...prev,
      view: "new",
    }));
  }, []);

  const handleTicketCreated = useCallback(
    (ticket: SupportTicketWithRelations) => {
      setState((prev) => ({
        ...prev,
        tickets: [ticket, ...prev.tickets],
        view: "chat",
        selectedTicket: ticket,
      }));
    },
    []
  );

  // Load tickets when widget opens
  useEffect(() => {
    if (state.isOpen && state.view === "tickets") {
      loadTickets();
    }
  }, [state.isOpen, state.view, loadTickets]);

  return (
    <>
      {/* Toggle Button */}
      <WidgetToggle
        isOpen={state.isOpen}
        onClick={handleToggle}
        theme={theme}
        position={position}
      />

      {/* Widget Panel */}
      {state.isOpen && (
        <div
          className={`
          fixed ${POSITION_CLASSES[position]} z-40
          w-80 sm:w-96 h-96 sm:h-[500px]
          rounded-lg shadow-2xl border-2
          ${THEME_CLASSES[theme]}
          transform transition-all duration-300
          ${state.isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}
          ${className}
        `}
        >
          {state.view === "tickets" && (
            <>
              <WidgetHeader
                title="تیکت‌های پشتیبانی"
                onClose={handleClose}
                theme={theme}
              />
              <TicketsList
                tickets={state.tickets}
                loading={state.loading}
                onSelectTicket={handleSelectTicket}
                onCreateNew={handleNewTicket}
                theme={theme}
              />
            </>
          )}

          {state.view === "new" && (
            <>
              <WidgetHeader
                title="تیکت جدید"
                onBack={handleBack}
                onClose={handleClose}
                theme={theme}
              />
              <div className="flex-1 overflow-y-auto p-4">
                <NewTicketForm
                  onSubmit={handleTicketCreated}
                  onCancel={handleBack}
                />
              </div>
            </>
          )}

          {state.view === "chat" && state.selectedTicket && (
            <ChatView
              ticket={state.selectedTicket}
              onBack={handleBack}
              theme={theme}
            />
          )}
        </div>
      )}
    </>
  );
};

export default SupportChatWidget;
export type { SupportChatWidgetProps };
