import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
import { columnsForSelect } from "@/modules/users/data/table";
import { UserRepository } from "@/modules/users/repo/UserRepository";
import { Button, Modal } from "ndui-ahrom";
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
          repo={new UserRepository()}
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
