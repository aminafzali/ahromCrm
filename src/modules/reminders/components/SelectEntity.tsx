// مسیر فایل: src/modules/reminders/components/SelectEntity.tsx

"use client";

import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
// ++ اصلاحیه: ایمپورت نام صحیح ستون‌ها ++
import { columnsForAdmin as invoiceColumns } from "@/modules/invoices/data/table";
import { InvoiceRepository } from "@/modules/invoices/repo/InvoiceRepository";
// ++ اصلاحیه: ایمپورت نام صحیح ستون‌ها ++
import { columnsForAdmin as requestColumns } from "@/modules/requests/data/table";
import { RequestRepository } from "@/modules/requests/repo/RequestRepository";
import { columnsForSelect as userColumns } from "@/modules/users/data/table";
import { UserRepository } from "@/modules/users/repo/UserRepository";
import { Modal } from "ndui-ahrom";

interface SelectEntityProps {
  entityType: "user" | "request" | "invoice";
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: any) => void;
}

export default function SelectEntity({
  entityType,
  isOpen,
  onClose,
  onSelect,
}: SelectEntityProps) {
  const handleSelect = (selectedItems: any[]) => {
    if (selectedItems && selectedItems.length > 0) {
      onSelect(selectedItems[0]);
    }
    onClose();
  };

  const getConfig = () => {
    switch (entityType) {
      case "user":
        return {
          repo: new UserRepository(),
          columns: userColumns,
          title: "انتخاب کاربر",
        };
      case "request":
        return {
          repo: new RequestRepository(),
          columns: requestColumns,
          title: "انتخاب درخواست",
        };
      case "invoice":
        return {
          repo: new InvoiceRepository(),
          columns: invoiceColumns,
          title: "انتخاب فاکتور",
        };
      default:
        return null;
    }
  };

  const config = getConfig();
  if (!config) return null;

  return (
    <Modal size="2xl" isOpen={isOpen} onClose={onClose} title={config.title}>
      <IndexWrapper
        columns={config.columns}
        repo={config.repo}
        selectionMode="single"
        onSelect={handleSelect}
        createUrl={false}
        showIconViews={false}
        defaultViewMode="table"
      />
    </Modal>
  );
}
