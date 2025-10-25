"use client";

import { Button, Modal, Select } from "ndui-ahrom";
import { useState } from "react";

interface ChangeStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (status: string) => void;
  currentStatus: string;
  ticketId: number;
}

export default function ChangeStatusModal({
  isOpen,
  onClose,
  onStatusChange,
  currentStatus,
  ticketId,
}: ChangeStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus);

  const statusOptions = [
    { value: "OPEN", label: "باز" },
    { value: "IN_PROGRESS", label: "در حال پیگیری" },
    { value: "PENDING", label: "در انتظار" },
    { value: "RESOLVED", label: "حل شده" },
    { value: "CLOSED", label: "بسته" },
  ];

  const handleStatusChange = () => {
    if (selectedStatus && selectedStatus !== currentStatus) {
      onStatusChange(selectedStatus);
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "text-blue-600";
      case "IN_PROGRESS":
        return "text-purple-600";
      case "PENDING":
        return "text-yellow-600";
      case "RESOLVED":
        return "text-green-600";
      case "CLOSED":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تغییر وضعیت تیکت">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            وضعیت فعلی
          </label>
          <div
            className={`p-2 rounded-md bg-gray-100 ${getStatusColor(
              currentStatus
            )}`}
          >
            {statusOptions.find((opt) => opt.value === currentStatus)?.label ||
              currentStatus}
          </div>
        </div>

        <Select
          name="status"
          label="وضعیت جدید"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          options={statusOptions}
        />

        <div className="flex justify-end space-x-2 space-x-reverse">
          <Button variant="ghost" onClick={onClose}>
            انصراف
          </Button>
          <Button
            variant="primary"
            onClick={handleStatusChange}
            disabled={selectedStatus === currentStatus}
          >
            تغییر وضعیت
          </Button>
        </div>
      </div>
    </Modal>
  );
}
