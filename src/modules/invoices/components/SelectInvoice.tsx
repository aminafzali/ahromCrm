// src/modules/payments/components/SelectInvoice.tsx
"use client";

import Modal from "@/@Client/Components/ui/Modal";
import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
import { columnsForAdmin } from "@/modules/invoices/data/table"; // مسیر ستون‌ها اصلاح شد
import { InvoiceRepository } from "@/modules/invoices/repo/InvoiceRepository"; // ریپازیتوری اصلاح شد
import { Button } from "ndui-ahrom";

import React, { useState } from "react";

interface SelectInvoiceProps {
  onSelect: (selectedItems: any) => void;
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
        انتخاب فاکتور{" "}
      </Button>

      <Modal
        size="2xl"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <IndexWrapper
          columns={columnsForAdmin}
          repo={new InvoiceRepository()} // ریپازیتوری اصلاح شد
          selectionMode="single"
          onSelect={handleSelect}
          createUrl={false}
          showIconViews={false}
          defaultViewMode="table"
        />
      </Modal>
    </>
  );
};

export default SelectInvoice;
