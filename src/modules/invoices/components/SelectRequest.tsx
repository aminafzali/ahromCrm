import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
import { columnsForAdmin } from "@/modules/requests/data/table";
import { RequestRepository } from "@/modules/requests/repo/RequestRepository";
import { Button, Modal } from "ndui-ahrom";
import React, { useState } from "react";

interface SelectRequestProps {
  onSelect: (selectedItems: any) => void;
  buttonProps?: Omit<React.ComponentProps<typeof Button>, "onClick">;
}

const SelectRequest: React.FC<SelectRequestProps> = ({
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
        انتخاب درخواست
      </Button>

      <Modal
        size="2xl"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <IndexWrapper
          columns={columnsForAdmin}
          repo={new RequestRepository()}
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

export default SelectRequest;
