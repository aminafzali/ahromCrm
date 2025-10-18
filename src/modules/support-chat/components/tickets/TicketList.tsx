"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { format } from "date-fns-jalali";
import PriorityBadge from "../ui/PriorityBadge";
import StatusBadge from "../ui/StatusBadge";

interface TicketListProps {
  tickets: any[];
  selectedTicketId?: number | null;
  onSelectTicket: (ticket: any) => void;
  loading?: boolean;
}

export default function TicketList({
  tickets = [],
  selectedTicketId,
  onSelectTicket,
  loading = false,
}: TicketListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <DIcon
          icon="fa-spinner"
          classCustom="text-4xl text-blue-500 animate-spin"
        />
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <DIcon icon="fa-ticket" classCustom="text-5xl mb-3" />
        <p>هیچ تیکتی یافت نشد</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {tickets.map((ticket) => {
        const isSelected = selectedTicketId === ticket.id;
        const customerName = ticket.workspaceUser
          ? ticket.workspaceUser.displayName
          : ticket.guestUser
          ? ticket.guestUser.name
          : "کاربر ناشناس";

        const lastMessageTime = ticket.lastActivityAt || ticket.createdAt;

        return (
          <button
            key={ticket.id}
            onClick={() => onSelectTicket(ticket)}
            className={`w-full text-right p-4 hover:bg-gray-50 transition-colors ${
              isSelected ? "bg-blue-50 border-r-4 border-blue-500" : ""
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500 font-mono">
                    #{ticket.ticketNumber}
                  </span>
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                </div>
                <h4 className="font-semibold text-gray-900 truncate">
                  {ticket.subject}
                </h4>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <DIcon icon="fa-user" classCustom="text-xs" cdi={false} />
                <span className="truncate">{customerName}</span>
              </div>

              {ticket._count?.messages > 0 && (
                <div className="flex items-center gap-1 text-gray-500">
                  <DIcon icon="fa-comment" classCustom="text-xs" cdi={false} />
                  <span>{ticket._count.messages}</span>
                </div>
              )}
            </div>

            <div className="text-xs text-gray-400 mt-2">
              {lastMessageTime
                ? format(new Date(lastMessageTime), "HH:mm - yyyy/MM/dd")
                : ""}
            </div>
          </button>
        );
      })}
    </div>
  );
}
