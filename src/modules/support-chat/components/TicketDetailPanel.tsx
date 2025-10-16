"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import { Button } from "ndui-ahrom";
import { useState } from "react";
import { SupportTicketWithRelations } from "../types";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";

interface TicketDetailPanelProps {
  ticket: SupportTicketWithRelations;
  onAssign: (assignToId: number) => void;
  onChangeStatus: (status: string) => void;
  onClose: () => void;
}

export default function TicketDetailPanel({
  ticket,
  onAssign,
  onChangeStatus,
  onClose,
}: TicketDetailPanelProps) {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<number | null>(
    null
  );
  const [selectedStatus, setSelectedStatus] = useState<string>(ticket.status);
  const customerName = ticket.workspaceUser
    ? ticket.workspaceUser.displayName
    : ticket.guestUser
    ? ticket.guestUser.name
    : "کاربر ناشناس";

  const customerEmail =
    ticket.workspaceUser?.user?.email || ticket.guestUser?.email || "-";
  const customerPhone =
    ticket.workspaceUser?.user?.phone || ticket.guestUser?.phone || "-";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 pb-4 border-b dark:border-slate-700">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              #{ticket.ticketNumber}
            </span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {ticket.subject}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          type="button"
        >
          <DIcon icon="fa-times" />
        </button>
      </div>

      {/* Description */}
      {ticket.description && (
        <div className="mb-4 pb-4 border-b dark:border-slate-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            شرح مشکل
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {ticket.description}
          </p>
        </div>
      )}

      {/* Customer Info */}
      <div className="mb-4 pb-4 border-b dark:border-slate-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          اطلاعات مشتری
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <DIcon icon="fa-user" classCustom="text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">
              {customerName}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DIcon icon="fa-envelope" classCustom="text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">
              {customerEmail}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DIcon icon="fa-phone" classCustom="text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">
              {customerPhone}
            </span>
          </div>
          {ticket.guestUser?.ipAddress && (
            <div className="flex items-center gap-2 text-sm">
              <DIcon icon="fa-map-marker-alt" classCustom="text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {ticket.guestUser.country || "نامشخص"} (
                {ticket.guestUser.ipAddress})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Info */}
      <div className="mb-4 pb-4 border-b dark:border-slate-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          تخصیص
        </h3>
        {ticket.assignedTo ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs font-medium">
                {ticket.assignedTo.displayName?.charAt(0).toUpperCase() ||
                  "ناشناس"}
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
              onClick={() => setShowAssignModal(true)}
              variant="ghost"
              size="sm"
            >
              تغییر
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setShowAssignModal(true)}
            className="w-full"
            icon={<DIcon icon="fa-user-plus" cdi={false} classCustom="ml-2" />}
          >
            تخصیص به کارشناس
          </Button>
        )}
      </div>

      {/* Category */}
      {ticket.category && (
        <div className="mb-4 pb-4 border-b dark:border-slate-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            دسته‌بندی
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <DIcon icon="fa-folder" classCustom="text-gray-400" />
            {ticket.category.name}
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            <DIcon icon="fa-clock" classCustom="ml-1" />
            ایجاد شده
          </span>
          <DateDisplay date={ticket.createdAt} className="relative" />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            <DIcon icon="fa-sync" classCustom="ml-1" />
            آخرین به‌روزرسانی
          </span>
          <DateDisplay date={ticket.updatedAt} className="relative" />
        </div>
        {ticket.closedAt && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              <DIcon icon="fa-check-circle" classCustom="ml-1" />
              بسته شده
            </span>
            <DateDisplay date={ticket.closedAt} className="relative" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t dark:border-slate-700">
        <Button
          onClick={() => setShowStatusModal(true)}
          className="w-full"
          icon={<DIcon icon="fa-edit" cdi={false} classCustom="ml-2" />}
        >
          تغییر وضعیت
        </Button>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">انتخاب کارشناس</h3>
            <input
              type="number"
              className="w-full border rounded px-3 py-2 mb-4 dark:bg-slate-700 dark:text-white"
              placeholder="ID کارشناس"
              value={selectedAssigneeId ?? ""}
              onChange={(e) => setSelectedAssigneeId(parseInt(e.target.value))}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowAssignModal(false)}>
                لغو
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (selectedAssigneeId) onAssign(selectedAssigneeId);
                  setShowAssignModal(false);
                }}
              >
                تایید
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">تغییر وضعیت تیکت</h3>
            <select
              className="w-full border rounded px-3 py-2 mb-4 dark:bg-slate-700 dark:text-white"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="OPEN">باز</option>
              <option value="IN_PROGRESS">در حال انجام</option>
              <option value="WAITING_CUSTOMER">در انتظار مشتری</option>
              <option value="PENDING">معلق</option>
              <option value="RESOLVED">حل شده</option>
              <option value="CLOSED">بسته شده</option>
            </select>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowStatusModal(false)}>
                لغو
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  onChangeStatus(selectedStatus);
                  setShowStatusModal(false);
                }}
              >
                تایید
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
