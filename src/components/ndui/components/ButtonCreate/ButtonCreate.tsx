import React, { useState } from "react";
import Button from "../Button/Button";
import Modal from "../Modal/Modal";

interface ButtonCreateProps extends Omit<React.ComponentProps<typeof Button>, 'onClick'> {
  modalTitle?: string;
  modalContent: React.ReactNode;
  approveText?: string;
  cancelText?: string;
  onApprove: () => void | Promise<void>;
}

const ButtonCreate: React.FC<ButtonCreateProps> = ({
  modalTitle,
  modalContent,
  approveText,
  cancelText,
  onApprove,
  ...buttonProps
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    try {
      setIsLoading(true);
      await onApprove();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error in approve action:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        {...buttonProps}
        onClick={() => setIsModalOpen(true)}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle || "Create"}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              {cancelText || "Cancel"}
            </Button>
            <Button
              variant="primary"
              onClick={handleApprove}
              loading={isLoading}
            >
              {approveText || "Create"}
            </Button>
          </>
        }
      >
        {modalContent}
      </Modal>
    </>
  );
};

export default ButtonCreate;