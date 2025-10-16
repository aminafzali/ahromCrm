"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { Button, Modal } from "ndui-ahrom";
import { useState } from "react";

interface AssignTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (agentId: number) => void;
  agents: Array<{ id: number; displayName: string; user?: { name: string } }>;
  currentAssignee?: { id: number; displayName: string };
  loading?: boolean;
}

export default function AssignTicketModal({
  isOpen,
  onClose,
  onAssign,
  agents,
  currentAssignee,
  loading = false,
}: AssignTicketModalProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(
    currentAssignee?.id || null
  );

  const handleAssign = () => {
    if (selectedAgentId) {
      onAssign(selectedAgentId);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            تخصیص تیکت
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            انتخاب کارشناس پشتیبانی
          </label>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedAgentId === agent.id
                    ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                    : "border-gray-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700"
                }`}
                onClick={() => setSelectedAgentId(agent.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-medium">
                      {agent.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {agent.displayName}
                      </div>
                      {agent.user?.name && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {agent.user.name}
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedAgentId === agent.id && (
                    <DIcon
                      icon="fa-check-circle"
                      classCustom="text-teal-500 text-xl"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleAssign}
            disabled={!selectedAgentId || loading}
            loading={loading}
            className="flex-1"
            icon={<DIcon icon="fa-user-check" cdi={false} classCustom="ml-2" />}
          >
            {loading ? "در حال تخصیص..." : "تخصیص تیکت"}
          </Button>
          <Button onClick={onClose} variant="ghost" className="flex-1">
            انصراف
          </Button>
        </div>
      </div>
    </Modal>
  );
}
