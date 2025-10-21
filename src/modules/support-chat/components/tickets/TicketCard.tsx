"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import React from "react";
import { SupportTicketWithRelations } from "../../types";
import PriorityBadge from "../ui/PriorityBadge";
import StatusBadge from "../ui/StatusBadge";

// Types
interface TicketCardProps {
  ticket: SupportTicketWithRelations;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "compact" | "detailed";
}

// Constants
const CARD_VARIANTS = {
  default: "p-4",
  compact: "p-3",
  detailed: "p-6",
} as const;

// Helper Functions
const getCustomerName = (ticket: SupportTicketWithRelations): string => {
  if (ticket.workspaceUser?.displayName) {
    return ticket.workspaceUser.displayName;
  }
  if (ticket.guestUser?.name) {
    return ticket.guestUser.name;
  }
  return "کاربر ناشناس";
};

const getAssigneeName = (ticket: SupportTicketWithRelations): string => {
  return ticket.assignedTo?.displayName || "تخصیص نیافته";
};

// Sub-components
const TicketHeader: React.FC<{
  ticket: SupportTicketWithRelations;
  variant: keyof typeof CARD_VARIANTS;
}> = ({ ticket, variant }) => (
  <div className="flex items-start justify-between mb-3">
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
          #{ticket.ticketNumber}
        </span>
        <StatusBadge status={ticket.status || "OPEN"} />
        <PriorityBadge priority={ticket.priority || "MEDIUM"} />
      </div>
      <h3
        className={`font-semibold text-gray-900 dark:text-white line-clamp-2 ${
          variant === "compact" ? "text-sm" : "text-base"
        }`}
      >
        {ticket.subject}
      </h3>
    </div>
  </div>
);

const TicketDescription: React.FC<{
  description: string;
  variant: keyof typeof CARD_VARIANTS;
}> = ({ description, variant }) => (
  <p
    className={`text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 ${
      variant === "compact" ? "text-xs" : "text-sm"
    }`}
  >
    {description}
  </p>
);

const TicketFooter: React.FC<{
  ticket: SupportTicketWithRelations;
  variant: keyof typeof CARD_VARIANTS;
}> = ({ ticket, variant }) => {
  const customerName = getCustomerName(ticket);
  const assigneeName = getAssigneeName(ticket);
  const textSize = variant === "compact" ? "text-xs" : "text-xs";

  return (
    <div
      className={`flex items-center justify-between ${textSize} text-gray-500 dark:text-gray-400`}
    >
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1">
          <DIcon icon="fa-user" classCustom="text-xs" />
          <span className="truncate max-w-20">{customerName}</span>
        </div>
        {ticket.assignedTo && (
          <div className="flex items-center gap-1">
            <DIcon icon="fa-user-tie" classCustom="text-xs" />
            <span className="truncate max-w-20">{assigneeName}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <DIcon icon="fa-clock" classCustom="text-xs" />
        <DateDisplay date={ticket.createdAt} className="relative" />
      </div>
    </div>
  );
};

const TicketMeta: React.FC<{
  ticket: SupportTicketWithRelations;
  variant: keyof typeof CARD_VARIANTS;
}> = ({ ticket, variant }) => {
  const showMeta = variant !== "compact";

  if (!showMeta) return null;

  return (
    <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100 dark:border-slate-700">
      {ticket.category && (
        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
          <DIcon icon="fa-folder" classCustom="ml-1 text-xs" />
          {ticket.category.name}
        </span>
      )}
      {ticket._count && (
        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
          <DIcon icon="fa-comment" classCustom="ml-1 text-xs" />
          {ticket._count.messages} پیام
        </span>
      )}
    </div>
  );
};

// Main Component
const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onClick,
  className = "",
  variant = "default",
}) => {
  const baseClasses =
    "bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all duration-200";
  const clickableClasses = onClick
    ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
    : "";
  const variantClasses = CARD_VARIANTS[variant];

  return (
    <div
      className={`${baseClasses} ${variantClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <TicketHeader ticket={ticket} variant={variant} />

      {ticket.description && (
        <TicketDescription description={ticket.description} variant={variant} />
      )}

      <TicketFooter ticket={ticket} variant={variant} />
      <TicketMeta ticket={ticket} variant={variant} />
    </div>
  );
};

export default TicketCard;
export type { TicketCardProps };
