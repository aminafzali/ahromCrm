import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
import { columnsForAdmin as invoiceColumns } from "@/modules/invoices/data/table";
import { InvoiceRepository } from "@/modules/invoices/repo/InvoiceRepository";
import { Button, Modal } from "ndui-ahrom";
import React, { useState } from "react";

interface SelectInvoiceProps {
  onSelect: (selectedItem: any) => void;
  buttonProps?: Omit<React.ComponentProps<typeof Button>, "onClick">;
}

const SelectInvoice: React.FC<SelectInvoiceProps> = ({
  onSelect,
  buttonProps,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelect = (selectedItems: any[]) => {
    onSelect(selectedItems[0]);
    setIsModalOpen(false); // بستن مودال بعد از انتخاب
  };

  return (
    <>
      <Button
        className="w-fit"
        {...buttonProps}
        onClick={() => setIsModalOpen(true)}
      >
        انتخاب فاکتور
      </Button>

      <Modal
        size="2xl"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <IndexWrapper
          columns={invoiceColumns}
          repo={new InvoiceRepository()}
          selectionMode="single"
          onSelect={handleSelect} // انتخاب و بستن مودال
          createUrl={false}
          showIconViews={false}
          defaultViewMode="table"
        />
      </Modal>
    </>
  );
};

export default SelectInvoice;
