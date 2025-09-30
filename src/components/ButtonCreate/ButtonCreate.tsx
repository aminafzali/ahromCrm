import { Button, Modal } from "ndui-ahrom";
import React, { useState } from "react";

interface ButtonCreateProps
  extends Omit<React.ComponentProps<typeof Button>, "onClick"> {
  modalTitle?: string;
  modalContent: React.ReactNode | ((closeModal: () => void) => React.ReactNode);
  approveText?: string;
  cancelText?: string;
  onApprove?: () => void | Promise<void>;
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

  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <Button {...buttonProps} onClick={() => setIsModalOpen(true)} />

      <Modal size="2xl" isOpen={isModalOpen} onClose={closeModal}>
        {typeof modalContent === "function"
          ? modalContent(closeModal)
          : modalContent}
      </Modal>
    </>
  );
};

export default ButtonCreate;
