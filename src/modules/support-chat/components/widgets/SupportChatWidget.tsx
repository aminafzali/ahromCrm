"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import React, { useCallback, useEffect, useState } from "react";
import { SupportTicketWithRelations } from "../../types";
import NewTicketForm from "../forms/NewTicketForm";
import CustomerChatWindow from "../layout/CustomerChatWindow";
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
  "bottom-right": "bottom-2 sm:bottom-4 right-2 sm:right-4",
  "bottom-left": "bottom-2 sm:bottom-4 left-2 sm:left-4",
  "top-right": "top-2 sm:top-4 right-2 sm:right-4",
  "top-left": "top-2 sm:top-4 left-2 sm:left-4",
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
      w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg transition-all duration-300
      ${isOpen ? "scale-90" : "scale-100 hover:scale-110"}
      ${THEME_CLASSES[theme]} border-2
      flex items-center justify-center
      hover:shadow-xl active:scale-95
    `}
    title={isOpen ? "بستن چت" : "باز کردن چت"}
  >
    <DIcon
      icon={isOpen ? "fa-times" : "fa-comments"}
      classCustom="text-lg sm:text-xl"
    />
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
          w-[calc(100vw-1rem)] sm:w-80 md:w-96 h-96 sm:h-[500px]
          max-w-sm sm:max-w-none
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
            <div className="flex-1 flex flex-col">
              <WidgetHeader
                title={`تیکت #${state.selectedTicket.ticketNumber}`}
                onBack={handleBack}
                onClose={handleClose}
                theme={theme}
              />
              <div className="flex-1">
                <CustomerChatWindow
                  ticket={state.selectedTicket}
                  onTicketUpdate={(updatedTicket) => {
                    setState((prev) => ({
                      ...prev,
                      selectedTicket: updatedTicket,
                    }));
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default SupportChatWidget;
export type { SupportChatWidgetProps };
