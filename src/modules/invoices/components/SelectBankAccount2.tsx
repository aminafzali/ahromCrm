import Modal from "@/@Client/Components/ui/Modal";
import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
import { columnsForSelect } from "@/modules/bank-accounts/data/table";
import { BankAccountRepository } from "@/modules/bank-accounts/repo/BankAccountRepository";
import { Button } from "ndui-ahrom";
import React, { useState } from "react";

interface SelectBankAccountProps {
  onSelect: (selectedItems: any) => void;
  buttonProps?: Omit<React.ComponentProps<typeof Button>, "onClick">;
  workspaceUserId?: number;
  filterDefault?: boolean;
}

const SelectBankAccount2: React.FC<SelectBankAccountProps> = ({
  onSelect,
  buttonProps,
  workspaceUserId,
  filterDefault = false,
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
        انتخاب حساب بانکی{" "}
      </Button>

      <Modal
        size="2xl"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <IndexWrapper
          columns={columnsForSelect}
          repo={new BankAccountRepository()}
          selectionMode="single"
          onSelect={handleSelect}
          createUrl={false}
          showIconViews={false}
          defaultViewMode="table"
          defaultFilter={
            workspaceUserId
              ? [{ workspaceUserId }]
              : filterDefault
              ? [{ isDefaultForReceive: true }, { isDefaultForPay: true }]
              : undefined
          }
        />
      </Modal>
    </>
  );
};

export default SelectBankAccount2;
