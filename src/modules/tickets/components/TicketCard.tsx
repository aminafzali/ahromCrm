"use client";

import { Button } from "ndui-ahrom";
import Link from "next/link";
import { TicketWithRelations } from "../types";
import PriorityBadge from "./ui/PriorityBadge";
import StatusBadge from "./ui/StatusBadge";

interface TicketCardProps {
  ticket: TicketWithRelations;
  onStatusChange?: (ticketId: number, status: string) => void;
  onAssign?: (ticketId: number, agentId: number) => void;
  showActions?: boolean;
}

export default function TicketCard({
  ticket,
  onStatusChange,
  onAssign,
  showActions = true,
}: TicketCardProps) {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("fa-IR");
  };

  const getAssigneeName = () => {
    if (ticket.assignedTo) {
      return (
        ticket.assignedTo.displayName ||
        ticket.assignedTo.user?.name ||
        `کاربر #${ticket.assignedTo.id}`
      );
    }
    return "تخصیص نیافته";
  };

  const getCustomerName = () => {
    if (ticket.workspaceUser) {
      return (
        ticket.workspaceUser.displayName ||
        ticket.workspaceUser.user?.name ||
        `کاربر #${ticket.workspaceUser.id}`
      );
    }
    if (ticket.guestUser) {
      return ticket.guestUser.name || ticket.guestUser.email || "مهمان";
    }
    return "نامشخص";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Link href={`/dashboard/tickets/${ticket.id}`}>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              {ticket.subject}
            </h3>
          </Link>
          <p className="text-sm text-gray-600 mt-1">
            شماره تیکت: {ticket.ticketNumber}
          </p>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <StatusBadge status={ticket.status} size="sm" />
          <PriorityBadge priority={ticket.priority} size="sm" />
        </div>
      </div>

      {ticket.description && (
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
          {ticket.description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
        <div>
          <span className="font-medium">مشتری:</span>
          <span className="mr-2">{getCustomerName()}</span>
        </div>
        <div>
          <span className="font-medium">تخصیص یافته به:</span>
          <span className="mr-2">{getAssigneeName()}</span>
        </div>
        <div>
          <span className="font-medium">تاریخ ایجاد:</span>
          <span className="mr-2">{formatDate(ticket.createdAt)}</span>
        </div>
        <div>
          <span className="font-medium">دسته:</span>
          <span className="mr-2">{ticket.category?.name || "بدون دسته"}</span>
        </div>
      </div>

      {showActions && (
        <div className="flex justify-end space-x-2 space-x-reverse">
          <Link href={`/dashboard/tickets/${ticket.id}`}>
            <Button variant="ghost" size="sm">
              مشاهده
            </Button>
          </Link>
          {onStatusChange && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStatusChange(ticket.id, ticket.status)}
            >
              تغییر وضعیت
            </Button>
          )}
          {onAssign && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAssign(ticket.id, ticket.assignedTo?.id || 0)}
            >
              تخصیص
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
