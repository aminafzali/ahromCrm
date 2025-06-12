import DIcon from "@/@Client/Components/common/DIcon";
import ReminderForm from "@/@Client/Components/common/ReminderForm";
import { Button, Modal } from "ndui-ahrom";
import { useState } from "react";
import { useRequest } from "../hooks/useRequest";

interface ReminderButtonProps {
  requestId: number;
  userId: number;
}

export default function ReminderButton({
  requestId,
  userId,
}: ReminderButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { createReminder, submitting: loading, error } = useRequest();

  const handleSubmit = async (data: any) => {
    try {
      await createReminder({
        ...data,
        entityId: requestId,
        entityType: "request",
        userId,
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating reminder:", error);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setIsModalOpen(true)}
        icon={<DIcon icon="fa-bell" cdi={false} classCustom="ml-2" />}
      >
        تنظیم یادآوری
      </Button>

      <Modal
        isOpen={isModalOpen}
        size="2xl"
        onClose={() => setIsModalOpen(false)}
        title="تنظیم یادآوری"
      >
        <div className="p-4">
          <ReminderForm
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        </div>
      </Modal>
    </>
  );
}
