"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import { SupportTicketWithRelations } from "../types";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";

interface TicketCardProps {
  ticket: SupportTicketWithRelations;
  onClick?: () => void;
}

export default function TicketCard({ ticket, onClick }: TicketCardProps) {
  const customerName = ticket.workspaceUser
    ? ticket.workspaceUser.displayName
    : ticket.guestUser
    ? ticket.guestUser.name
    : "کاربر ناشناس";

  const assigneeName = ticket.assignedTo?.displayName || "تخصیص نیافته";

  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              #{ticket.ticketNumber}
            </span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
            {ticket.subject}
          </h3>
        </div>
      </div>

      {/* Description */}
      {ticket.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {ticket.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <DIcon icon="fa-user" classCustom="text-xs" />
            <span>{customerName}</span>
          </div>
          {ticket.assignedTo && (
            <div className="flex items-center gap-1">
              <DIcon icon="fa-user-tie" classCustom="text-xs" />
              <span>{assigneeName}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <DIcon icon="fa-clock" classCustom="text-xs" />
          <DateDisplay date={ticket.createdAt} className="relative" />
        </div>
      </div>

      {/* Category & Messages Count */}
      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100 dark:border-slate-700">
        {ticket.category && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            <DIcon icon="fa-folder" classCustom="ml-1 text-xs" />
            {ticket.category.name}
          </span>
        )}
        {ticket._count && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            <DIcon icon="fa-comment" classCustom="ml-1 text-xs" />
            {ticket._count.messages} پیام
          </span>
        )}
      </div>
    </div>
  );
}
