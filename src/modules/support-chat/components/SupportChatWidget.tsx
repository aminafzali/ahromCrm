"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { useEffect, useState } from "react";
import { useSupportChat } from "../hooks/useSupportChat";
import { SupportTicketWithRelations } from "../types";
import CustomerChatWindow from "./CustomerChatWindow";
import NewTicketForm from "./NewTicketForm";

export default function SupportChatWidget() {
  const { repo } = useSupportChat();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"list" | "chat" | "new">("list");
  const [tickets, setTickets] = useState<SupportTicketWithRelations[]>([]);
  const [selectedTicket, setSelectedTicket] =
    useState<SupportTicketWithRelations | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMyTickets();
    }
  }, [isOpen]);

  const loadMyTickets = async () => {
    setLoading(true);
    try {
      const response: any = await repo.getMyTickets();
      setTickets(response?.data || []);
    } catch (error) {
      console.error("Error loading tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewTicket = () => {
    setView("new");
  };

  const handleTicketCreated = (ticket: SupportTicketWithRelations) => {
    setTickets([ticket, ...tickets]);
    setSelectedTicket(ticket);
    setView("chat");
  };

  const handleSelectTicket = (ticket: SupportTicketWithRelations) => {
    setSelectedTicket(ticket);
    setView("chat");
  };

  const handleBack = () => {
    setSelectedTicket(null);
    setView("list");
  };

  return (
    <>
      {/* Widget Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-50"
        type="button"
      >
        {isOpen ? (
          <DIcon icon="fa-times" classCustom="text-xl" />
        ) : (
          <DIcon icon="fa-comments" classCustom="text-xl" />
        )}
      </button>

      {/* Widget Panel */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 w-96 h-[600px] bg-white dark:bg-slate-800 rounded-lg shadow-2xl flex flex-col z-50 border dark:border-slate-700">
          {/* Header */}
          <div className="bg-teal-500 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {view !== "list" && (
                  <button
                    onClick={handleBack}
                    className="text-white hover:text-teal-100"
                    type="button"
                  >
                    <DIcon icon="fa-arrow-right" />
                  </button>
                )}
                <h3 className="font-bold">
                  {view === "list"
                    ? "پشتیبانی"
                    : view === "new"
                    ? "تیکت جدید"
                    : "گفتگو"}
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-teal-100"
                type="button"
              >
                <DIcon icon="fa-times" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {view === "list" && (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b dark:border-slate-700">
                  <button
                    onClick={handleNewTicket}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    type="button"
                  >
                    <DIcon icon="fa-plus" />
                    <span>تیکت جدید</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <DIcon
                        icon="fa-spinner fa-spin"
                        classCustom="text-3xl text-gray-400"
                      />
                    </div>
                  ) : tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <DIcon
                        icon="fa-inbox"
                        classCustom="text-5xl text-gray-300 mb-3"
                      />
                      <p className="text-gray-500 dark:text-gray-400">
                        تیکتی وجود ندارد
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          onClick={() => handleSelectTicket(ticket)}
                          className="p-3 border dark:border-slate-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                              {ticket.subject}
                            </div>
                            <span className="text-xs text-gray-500">
                              #{ticket.ticketNumber.split("-").pop()}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                            {ticket.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {view === "new" && (
              <NewTicketForm
                onSubmit={handleTicketCreated}
                onCancel={handleBack}
              />
            )}

            {view === "chat" && selectedTicket && (
              <CustomerChatWindow ticket={selectedTicket} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
