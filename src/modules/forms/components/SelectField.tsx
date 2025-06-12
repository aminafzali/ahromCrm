import DIcon from "@/@Client/Components/common/DIcon";
import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
import { columnsForSelect, listItemRender } from "@/modules/fields/data/table";
import { FieldRepository } from "@/modules/fields/repo/FieldRepository";
import { Button, Modal } from "ndui-ahrom";
import React, { useState } from "react";

interface SelectFieldProps {
  onSelect: (selectedItems: any[]) => void;
  buttonProps?: Omit<React.ComponentProps<typeof Button>, "onClick">;
}

const SelectField: React.FC<SelectFieldProps> = ({ onSelect, buttonProps }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelect = (selectedItems: any[]) => {
    onSelect(selectedItems);
    setIsModalOpen(false); // Close modal after selection
  };

  return (
    <>
      <Button
        className="w-full"
        icon={<DIcon icon="fa-plus" cdi={false} classCustom="!mx-0" />}
        {...buttonProps}
        onClick={() => setIsModalOpen(true)}
      />

      <Modal
        size="2xl"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <IndexWrapper
          columns={columnsForSelect}
          listItemRender={listItemRender}
          repo={new FieldRepository()}
          selectionMode="multiple"
          onSelect={handleSelect} // Call both onSelect and closeModal
          createUrl={false}
          showIconViews={false}
          defaultViewMode="table"
        />
      </Modal>
    </>
  );
};

export default SelectField;
