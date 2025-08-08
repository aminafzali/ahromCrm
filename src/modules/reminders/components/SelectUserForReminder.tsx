// مسیر فایل: src/modules/reminders/components/SelectUserForReminder.tsx
"use client";
import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
import { columnsForSelect } from "@/modules/users/data/table";
import { WorkspaceUserRepository } from "@/modules/workspace-users/repo/WorkspaceUserRepository";
import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
import { Button, Modal } from "ndui-ahrom";
import { useState } from "react";

interface SelectUserForReminderProps {
  onSelect: (selectedUser: WorkspaceUserWithRelations) => void;
  selectedUserName?: string | null;
}
export default function SelectUserForReminder({
  onSelect,
  selectedUserName,
}: SelectUserForReminderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleSelect = (selectedItems: any[]) => {
    if (selectedItems && selectedItems.length > 0) onSelect(selectedItems[0]);
    setIsModalOpen(false);
  };
  return (
    <>
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          value={selectedUserName || ""}
          placeholder="کاربری انتخاب نشده است"
          readOnly
          onClick={() => setIsModalOpen(true)}
          style={{ cursor: "pointer" }}
        />
        <Button
          className="btn btn-outline-secondary"
          type="button"
          onClick={() => setIsModalOpen(true)}
        >
          انتخاب کاربر
        </Button>
      </div>
      <Modal
        size="2xl"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="انتخاب کاربر"
      >
        <IndexWrapper
          columns={columnsForSelect}
          repo={new WorkspaceUserRepository()}
          selectionMode="single"
          onSelect={handleSelect}
          createUrl={false}
          showIconViews={false}
          defaultViewMode="table"
        />
      </Modal>
    </>
  );
}
