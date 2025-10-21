"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import { Button } from "ndui-ahrom";
import React, { useCallback, useEffect, useState } from "react";
import { SupportTicketWithRelations } from "../../types";
import PriorityBadge from "../ui/PriorityBadge";
import StatusBadge from "../ui/StatusBadge";

// Types
interface TicketDetailPanelProps {
  ticket: SupportTicketWithRelations;
  onAssign: (assignToId: number) => void;
  onChangeStatus: (status: string) => void;
  onClose: () => void;
  className?: string;
}

interface Agent {
  id: number;
  displayName: string;
  user: {
    name: string;
    email: string;
  };
  isOnline?: boolean;
}

interface StatusOption {
  value: string;
  label: string;
  icon: string;
  color: string;
  description: string;
}

// Constants
const STATUS_OPTIONS: StatusOption[] = [
  {
    value: "OPEN",
    label: "باز",
    icon: "fa-folder-open",
    color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20",
    description: "تیکت جدید و در انتظار بررسی",
  },
  {
    value: "IN_PROGRESS",
    label: "در حال بررسی",
    icon: "fa-spinner",
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
    description: "تیکت در حال بررسی توسط کارشناس",
  },
  {
    value: "PENDING",
    label: "در انتظار",
    icon: "fa-clock",
    color: "text-orange-600 bg-orange-100 dark:bg-orange-900/20",
    description: "در انتظار اطلاعات بیشتر از مشتری",
  },
  {
    value: "WAITING_CUSTOMER",
    label: "منتظر پاسخ مشتری",
    icon: "fa-user-clock",
    color: "text-purple-600 bg-purple-100 dark:bg-purple-900/20",
    description: "منتظر پاسخ مشتری",
  },
  {
    value: "RESOLVED",
    label: "حل شده",
    icon: "fa-check-circle",
    color: "text-green-600 bg-green-100 dark:bg-green-900/20",
    description: "مشکل حل شده و در انتظار تایید مشتری",
  },
  {
    value: "CLOSED",
    label: "بسته شده",
    icon: "fa-times-circle",
    color: "text-gray-600 bg-gray-100 dark:bg-gray-900/20",
    description: "تیکت بسته شده",
  },
];

// Helper Functions
const getCustomerInfo = (ticket: SupportTicketWithRelations) => {
  if (ticket.workspaceUser) {
    return {
      name: ticket.workspaceUser.displayName || "کاربر ناشناس",
      email: ticket.workspaceUser.user?.email || "-",
      phone: "-", // Phone not available in current user type
      type: "registered" as const,
    };
  }

  if (ticket.guestUser) {
    return {
      name: ticket.guestUser.name || "مهمان ناشناس",
      email: ticket.guestUser.email || "-",
      phone: ticket.guestUser.phone || "-",
      type: "guest" as const,
    };
  }

  return {
    name: "کاربر ناشناس",
    email: "-",
    phone: "-",
    type: "unknown" as const,
  };
};

// Sub-components
const CustomerInfo: React.FC<{
  ticket: SupportTicketWithRelations;
}> = ({ ticket }) => {
  const customer = getCustomerInfo(ticket);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
        اطلاعات مشتری
      </h3>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <DIcon icon="fa-user" classCustom="text-gray-400 w-4" />
          <span className="text-gray-600 dark:text-gray-400">
            {customer.name}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              customer.type === "registered"
                ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                : customer.type === "guest"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300"
            }`}
          >
            {customer.type === "registered"
              ? "ثبت‌نام شده"
              : customer.type === "guest"
              ? "مهمان"
              : "ناشناس"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <DIcon icon="fa-envelope" classCustom="text-gray-400 w-4" />
          <span className="text-gray-600 dark:text-gray-400">
            {customer.email}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <DIcon icon="fa-phone" classCustom="text-gray-400 w-4" />
          <span className="text-gray-600 dark:text-gray-400">
            {customer.phone}
          </span>
        </div>

        {ticket.guestUser?.ipAddress && (
          <div className="flex items-center gap-2 text-sm">
            <DIcon icon="fa-map-marker-alt" classCustom="text-gray-400 w-4" />
            <span className="text-gray-600 dark:text-gray-400">
              {ticket.guestUser.country || "نامشخص"} (
              {ticket.guestUser.ipAddress})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const AssignmentInfo: React.FC<{
  ticket: SupportTicketWithRelations;
  onAssign: (assignToId: number) => void;
}> = ({ ticket, onAssign }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAgents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/support-chat/agents");
      if (response.ok) {
        const data = await response.json();
        setAgents(data.data || []);
      }
    } catch (error) {
      console.error("Error loading agents:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
        تخصیص
      </h3>

      {ticket.assignedTo ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs font-medium">
              {ticket.assignedTo.displayName?.charAt(0).toUpperCase() || "ن"}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {ticket.assignedTo.displayName}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                کارشناس پشتیبانی
              </div>
            </div>
          </div>
          <Button
            onClick={() => onAssign(ticket.assignedTo!.id)}
            variant="ghost"
            size="sm"
          >
            تغییر
          </Button>
        </div>
      ) : (
        <div className="text-center py-4">
          <DIcon
            icon="fa-user-plus"
            classCustom="text-2xl text-gray-400 mb-2"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            تیکت به کارشناسی تخصیص نیافته است
          </p>
          <Button
            onClick={() => onAssign(0)} // Will open assignment modal
            size="sm"
            className="w-full"
          >
            تخصیص به کارشناس
          </Button>
        </div>
      )}
    </div>
  );
};

const StatusSection: React.FC<{
  ticket: SupportTicketWithRelations;
  onChangeStatus: (status: string) => void;
}> = ({ ticket, onChangeStatus }) => {
  const currentStatus = STATUS_OPTIONS.find(
    (option) => option.value === ticket.status
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
        وضعیت فعلی
      </h3>

      <div className="flex items-center gap-2">
        <StatusBadge status={ticket.status || "OPEN"} />
        <Button
          onClick={() => onChangeStatus(ticket.status)}
          variant="ghost"
          size="sm"
        >
          تغییر
        </Button>
      </div>

      {currentStatus && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {currentStatus.description}
        </p>
      )}
    </div>
  );
};

const TicketMeta: React.FC<{
  ticket: SupportTicketWithRelations;
}> = ({ ticket }) => (
  <div className="space-y-3">
    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
      اطلاعات تیکت
    </h3>

    <div className="space-y-2 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-gray-500 dark:text-gray-400">شماره تیکت</span>
        <span className="font-mono text-gray-900 dark:text-white">
          #{ticket.ticketNumber}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-gray-500 dark:text-gray-400">اولویت</span>
        <PriorityBadge priority={ticket.priority || "MEDIUM"} />
      </div>

      {ticket.category && (
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">دسته‌بندی</span>
          <span className="text-gray-900 dark:text-white">
            {ticket.category.name}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-gray-500 dark:text-gray-400">تاریخ ایجاد</span>
        <DateDisplay date={ticket.createdAt} className="relative" />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-gray-500 dark:text-gray-400">
          آخرین به‌روزرسانی
        </span>
        <DateDisplay date={ticket.updatedAt} className="relative" />
      </div>

      {ticket.closedAt && (
        <div className="flex items-center justify-between">
          <span className="text-gray-500 dark:text-gray-400">
            تاریخ بسته شدن
          </span>
          <DateDisplay date={ticket.closedAt} className="relative" />
        </div>
      )}
    </div>
  </div>
);

// Main Component
const TicketDetailPanel: React.FC<TicketDetailPanelProps> = ({
  ticket,
  onAssign,
  onChangeStatus,
  onClose,
  className = "",
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 p-4 space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              #{ticket.ticketNumber}
            </span>
            <StatusBadge status={ticket.status || "OPEN"} />
            <PriorityBadge priority={ticket.priority || "MEDIUM"} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
            {ticket.subject}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <DIcon icon="fa-times" />
        </button>
      </div>

      {/* Description */}
      {ticket.description && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            شرح مشکل
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {ticket.description}
          </p>
        </div>
      )}

      {/* Customer Info */}
      <CustomerInfo ticket={ticket} />

      {/* Assignment Info */}
      <AssignmentInfo ticket={ticket} onAssign={onAssign} />

      {/* Status Section */}
      <StatusSection ticket={ticket} onChangeStatus={onChangeStatus} />

      {/* Ticket Meta */}
      <TicketMeta ticket={ticket} />
    </div>
  );
};

export default TicketDetailPanel;
export type { TicketDetailPanelProps };
