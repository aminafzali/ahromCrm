"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { SupportTicketStatus } from "@prisma/client";
import { Button, Modal } from "ndui-ahrom";
import { useState } from "react";

interface ChangeStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeStatus: (status: SupportTicketStatus) => void;
  currentStatus: SupportTicketStatus;
  loading?: boolean;
}

const statusOptions = [
  {
    value: "OPEN" as SupportTicketStatus,
    label: "باز",
    icon: "fa-folder-open",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  {
    value: "PENDING" as SupportTicketStatus,
    label: "در انتظار",
    icon: "fa-hourglass-half",
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  },
  {
    value: "IN_PROGRESS" as SupportTicketStatus,
    label: "در حال بررسی",
    icon: "fa-spinner",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  },
  {
    value: "WAITING_CUSTOMER" as SupportTicketStatus,
    label: "منتظر پاسخ مشتری",
    icon: "fa-user-clock",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  },
  {
    value: "RESOLVED" as SupportTicketStatus,
    label: "حل شده",
    icon: "fa-check-circle",
    color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
  {
    value: "CLOSED" as SupportTicketStatus,
    label: "بسته شده",
    icon: "fa-times-circle",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
  },
];

export default function ChangeStatusModal({
  isOpen,
  onClose,
  onChangeStatus,
  currentStatus,
  loading = false,
}: ChangeStatusModalProps) {
  const [selectedStatus, setSelectedStatus] =
    useState<SupportTicketStatus>(currentStatus);

  const handleChangeStatus = () => {
    if (selectedStatus !== currentStatus) {
      onChangeStatus(selectedStatus);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            تغییر وضعیت تیکت
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            type="button"
          >
            <DIcon icon="fa-times" />
          </button>
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-2 gap-3">
            {statusOptions.map((option) => (
              <div
                key={option.value}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedStatus === option.value
                    ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                    : "border-gray-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700"
                }`}
                onClick={() => setSelectedStatus(option.value)}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={`p-3 rounded-lg ${option.color}`}>
                    <DIcon icon={option.icon} classCustom="text-xl" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </span>
                  {selectedStatus === option.value && (
                    <DIcon
                      icon="fa-check-circle"
                      classCustom="text-teal-500 text-lg"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleChangeStatus}
            disabled={selectedStatus === currentStatus || loading}
            loading={loading}
            className="flex-1"
            icon={<DIcon icon="fa-save" cdi={false} classCustom="ml-2" />}
          >
            {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </Button>
          <Button onClick={onClose} variant="ghost" className="flex-1">
            انصراف
          </Button>
        </div>
      </div>
    </Modal>
  );
}
