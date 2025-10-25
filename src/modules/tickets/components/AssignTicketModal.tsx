"use client";

import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { Button, Modal, Select } from "ndui-ahrom";
import { useState } from "react";

interface AssignTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (agentId: number) => void;
  ticketId: number;
}

export default function AssignTicketModal({
  isOpen,
  onClose,
  onAssign,
  ticketId,
}: AssignTicketModalProps) {
  const { getAll: getAllUsers } = useWorkspaceUser();
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [users, setUsers] = useState<{ value: number; label: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers({ page: 1, limit: 100 });
      const userOptions = (response?.data || []).map((user: any) => ({
        value: user.id,
        label: user.displayName || user.user?.name || `کاربر #${user.id}`,
      }));
      setUsers(userOptions);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = () => {
    if (selectedAgent) {
      onAssign(selectedAgent);
      onClose();
    }
  };

  const handleOpen = () => {
    if (isOpen && users.length === 0) {
      loadUsers();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تخصیص تیکت">
      <div className="space-y-4">
        <Select
          name="agent"
          label="انتخاب کارشناس"
          value={selectedAgent || ""}
          onChange={(e) => setSelectedAgent(Number(e.target.value))}
          options={users}
          placeholder="کارشناس را انتخاب کنید"
        />

        <div className="flex justify-end space-x-2 space-x-reverse">
          <Button variant="ghost" onClick={onClose}>
            انصراف
          </Button>
          <Button
            variant="primary"
            onClick={handleAssign}
            disabled={!selectedAgent}
          >
            تخصیص
          </Button>
        </div>
      </div>
    </Modal>
  );
}
