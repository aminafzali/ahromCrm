import Modal from "@/@Client/Components/ui/Modal";
import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
import { columnsForSelect } from "@/modules/workspace-users/data/table";
import { WorkspaceUserRepository } from "@/modules/workspace-users/repo/WorkspaceUserRepository";
import { Button } from "ndui-ahrom";
import React, { useState } from "react";

interface SelectRequestProps {
  onSelect: (selectedItems: any) => void;
  buttonProps?: Omit<React.ComponentProps<typeof Button>, "onClick">;
}

const SelectUser2: React.FC<SelectRequestProps> = ({
  onSelect,
  buttonProps,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelect = (selectedItems: any[]) => {
    onSelect(selectedItems[0]);
    setIsModalOpen(false); // Close modal after selection
  };

  return (
    <>
      <Button
        className="w-fit"
        {...buttonProps}
        onClick={() => setIsModalOpen(true)}
      >
        انتخاب کاربر{" "}
      </Button>

      <Modal
        size="2xl"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <IndexWrapper
          columns={columnsForSelect}
          repo={new WorkspaceUserRepository()}
          selectionMode="single"
          onSelect={handleSelect} // Call both onSelect and closeModal
          createUrl={false}
          showIconViews={false}
          defaultViewMode="table"
        />
      </Modal>
    </>
  );
};

export default SelectUser2;
