import { Button, Modal } from "ndui-ahrom";
import React, { useState } from "react";
import DIcon from "./DIcon";

interface ButtonDeleteProps {
  row: any;
  onDelete: (row: any) => void;
  showLabels?: boolean;
  showLabel?: boolean;
  size?: "xs" | "sm" | "md";
  confirmDelete?: boolean;
  labels?: {
    delete?: string;
    deleteConfirm?: string;
    deleteCancel?: string;
    deleteTitle?: string;
    deleteMessage?: string;
  };
  icon?: React.ReactNode;
}

const ButtonDelete: React.FC<ButtonDeleteProps> = ({
  row,
  onDelete,
  showLabels = true,
  showLabel = true,
  size = "md",
  confirmDelete = true,
  labels = {
    delete: "حذف",
    deleteConfirm: "حذف کن",
    deleteCancel: "لغو",
    deleteTitle: "حذف ",
    deleteMessage: "آیا از حذف مطمین هستید؟",
  },
  icon,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDelete = () => {
    if (confirmDelete) {
      setIsDeleteModalOpen(true);
    } else {
      onDelete(row);
    }
  };

  const confirmDeleteAction = () => {
    onDelete(row);
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        onClick={handleDelete}
        className="text-error"
        aria-label={labels.delete}
        size={size}
      >
        <DIcon icon="fa-trash" cdi={false} classCustom="text-error text-xl" />
        {showLabel && <span className="ml-1">{labels.delete}</span>}
      </Button>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={labels.deleteTitle}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
              {labels.deleteCancel}
            </Button>
            <Button
              variant="primary"
              className="bg-error text-error-content"
              onClick={confirmDeleteAction}
            >
              {labels.deleteConfirm}
            </Button>
          </>
        }
      >
        <p>{labels.deleteMessage}</p>
      </Modal>
    </>
  );
};

export default ButtonDelete;
