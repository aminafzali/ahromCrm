// مسیر فایل: src/modules/notifications/components/SubjectSelector.tsx
"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import { useInvoice } from "@/modules/invoices/hooks/useInvoice";
import { usePayment } from "@/modules/payments/hooks/usePayment";
import { useReminder } from "@/modules/reminders/hooks/useReminder";
import { useRequest } from "@/modules/requests/hooks/useRequest";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { Button, Card, Input, Modal } from "ndui-ahrom";
import { useEffect, useState } from "react";

interface SubjectSelectorProps {
  onSubjectSelect: (
    subject: {
      type: "REQUEST" | "INVOICE" | "USER" | "PAYMENT" | "REMINDER" | "GENERAL";
      entity: any;
      entityId?: number;
    } | null
  ) => void;
  selectedSubject?: {
    type: string;
    entity: any;
  } | null;
}

export default function SubjectSelector({
  onSubjectSelect,
  selectedSubject,
}: SubjectSelectorProps) {
  const [subjectType, setSubjectType] = useState<
    "REQUEST" | "INVOICE" | "USER" | "PAYMENT" | "REMINDER" | "GENERAL" | null
  >(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleTypeSelect = (
    type: "REQUEST" | "INVOICE" | "USER" | "PAYMENT" | "REMINDER" | "GENERAL"
  ) => {
    setSubjectType(type);
    if (type !== "GENERAL") {
      setPickerOpen(true);
    } else {
      onSubjectSelect({ type: "GENERAL", entity: null });
    }
  };

  const handleEntitySelect = (entity: any) => {
    if (!subjectType || subjectType === "GENERAL") return;
    onSubjectSelect({
      type: subjectType,
      entity,
      entityId: entity.id,
    });
    setPickerOpen(false);
  };

  const clearSubject = () => {
    setSubjectType(null);
    onSubjectSelect(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">
          این اعلان برای چیست؟ (اختیاری)
        </label>
        <p className="text-xs text-base-content/60 mb-3">
          موضوع اعلان را مشخص کنید تا بدانید این اعلان به چه چیزی مرتبط است.
          کاربر انتخاب شده به‌صورت خودکار به لیست ارسال اضافه می‌شود.
        </p>

        {!selectedSubject && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleTypeSelect("REQUEST")}
              icon={<DIcon icon="fa-file-alt" cdi={false} />}
            >
              درخواست
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleTypeSelect("INVOICE")}
              icon={<DIcon icon="fa-file-invoice-dollar" cdi={false} />}
            >
              فاکتور
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleTypeSelect("PAYMENT")}
              icon={<DIcon icon="fa-money-bill" cdi={false} />}
            >
              پرداخت
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleTypeSelect("REMINDER")}
              icon={<DIcon icon="fa-calendar-check" cdi={false} />}
            >
              یادآور
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleTypeSelect("USER")}
              icon={<DIcon icon="fa-user" cdi={false} />}
            >
              کاربر
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleTypeSelect("GENERAL")}
              icon={<DIcon icon="fa-info-circle" cdi={false} />}
            >
              عمومی
            </Button>
          </div>
        )}

        {selectedSubject && (
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <DIcon
                    icon={
                      selectedSubject.type === "REQUEST"
                        ? "fa-file-alt"
                        : selectedSubject.type === "INVOICE"
                        ? "fa-file-invoice-dollar"
                        : selectedSubject.type === "PAYMENT"
                        ? "fa-money-bill"
                        : selectedSubject.type === "REMINDER"
                        ? "fa-calendar-check"
                        : selectedSubject.type === "USER"
                        ? "fa-user"
                        : "fa-info-circle"
                    }
                    cdi={false}
                  />
                </div>
                <div>
                  <p className="text-sm text-base-content/60">موضوع:</p>
                  <p className="font-medium">
                    {selectedSubject.type === "REQUEST" &&
                      `درخواست #${selectedSubject.entity?.id}`}
                    {selectedSubject.type === "INVOICE" &&
                      `فاکتور #${selectedSubject.entity?.id}`}
                    {selectedSubject.type === "PAYMENT" &&
                      `پرداخت #${selectedSubject.entity?.id}`}
                    {selectedSubject.type === "REMINDER" &&
                      (selectedSubject.entity?.title ||
                        `یادآور #${selectedSubject.entity?.id}`)}
                    {selectedSubject.type === "USER" &&
                      (selectedSubject.entity?.displayName ||
                        selectedSubject.entity?.user?.name ||
                        "کاربر")}
                    {selectedSubject.type === "GENERAL" && "عمومی"}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={clearSubject}>
                <DIcon icon="fa-times" cdi={false} />
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Entity Picker Modal */}
      {pickerOpen && subjectType && subjectType !== "GENERAL" && (
        <EntityPicker
          isOpen={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={handleEntitySelect}
          type={subjectType}
        />
      )}
    </div>
  );
}

/* Entity Picker Component */
interface EntityPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (entity: any) => void;
  type: "REQUEST" | "INVOICE" | "USER" | "PAYMENT" | "REMINDER";
}

function EntityPicker({ isOpen, onClose, onSelect, type }: EntityPickerProps) {
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { getAll: getAllRequests } = useRequest();
  const { getAll: getAllInvoices } = useInvoice();
  const { getAll: getAllPayments } = usePayment();
  const { getAll: getAllReminders } = useReminder();
  const { getAll: getAllUsers } = useWorkspaceUser();

  useEffect(() => {
    if (isOpen) {
      loadEntities();
    }
  }, [isOpen, type]);

  const loadEntities = async () => {
    setLoading(true);
    try {
      let result: any;
      if (type === "REQUEST") {
        result = await getAllRequests({
          page: 1,
          limit: 1000,
          include: "serviceType,status,workspaceUser.user",
        } as any);
      } else if (type === "INVOICE") {
        result = await getAllInvoices({
          page: 1,
          limit: 1000,
          include: "workspaceUser.user",
        } as any);
      } else if (type === "PAYMENT") {
        result = await getAllPayments({
          page: 1,
          limit: 1000,
          include: "workspaceUser.user",
        } as any);
      } else if (type === "REMINDER") {
        result = await getAllReminders({
          page: 1,
          limit: 1000,
          include: "workspaceUser.user",
        } as any);
      } else if (type === "USER") {
        result = await getAllUsers({ page: 1, limit: 1000 });
      }
      setEntities(result?.data || []);
    } catch (e) {
      console.error("Error loading entities:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntities = entities.filter((entity) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();

    if (type === "REQUEST") {
      return (
        entity.id?.toString().includes(q) ||
        entity.workspaceUser?.displayName?.toLowerCase().includes(q) ||
        entity.workspaceUser?.user?.name?.toLowerCase().includes(q)
      );
    } else if (type === "INVOICE") {
      return (
        entity.id?.toString().includes(q) ||
        entity.workspaceUser?.displayName?.toLowerCase().includes(q) ||
        entity.workspaceUser?.user?.name?.toLowerCase().includes(q)
      );
    } else if (type === "PAYMENT") {
      return (
        entity.id?.toString().includes(q) ||
        entity.workspaceUser?.displayName?.toLowerCase().includes(q) ||
        entity.workspaceUser?.user?.name?.toLowerCase().includes(q)
      );
    } else if (type === "REMINDER") {
      return (
        entity.title?.toLowerCase().includes(q) ||
        entity.description?.toLowerCase().includes(q)
      );
    } else if (type === "USER") {
      return (
        entity.displayName?.toLowerCase().includes(q) ||
        entity.user?.name?.toLowerCase().includes(q) ||
        entity.user?.phone?.includes(q)
      );
    }
    return true;
  });

  const getTitle = () => {
    if (type === "REQUEST") return "انتخاب درخواست";
    if (type === "INVOICE") return "انتخاب فاکتور";
    if (type === "PAYMENT") return "انتخاب پرداخت";
    if (type === "REMINDER") return "انتخاب یادآور";
    if (type === "USER") return "انتخاب کاربر";
    return "انتخاب";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <div className="p-4 max-h-[72vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{getTitle()}</h3>
          <Button variant="ghost" onClick={onClose}>
            <DIcon icon="fa-times" cdi={false} />
          </Button>
        </div>

        <Input
          name="entitySearch"
          placeholder="جستجو..."
          value={searchQuery}
          onChange={(e: any) => setSearchQuery(e.target.value)}
          className="mb-4"
        />

        <div className="overflow-x-auto rounded-md border bg-white">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="p-3 text-right w-20 font-semibold text-gray-700">
                  شناسه
                </th>
                <th className="p-3 text-right font-semibold text-gray-700">
                  {type === "REMINDER"
                    ? "عنوان"
                    : type === "INVOICE"
                    ? "شماره فاکتور"
                    : type === "REQUEST"
                    ? "نوع درخواست"
                    : type === "PAYMENT"
                    ? "نوع پرداخت"
                    : "نام"}
                </th>
                <th className="p-3 text-right font-semibold text-gray-700">
                  {type === "INVOICE" ||
                  type === "REQUEST" ||
                  type === "PAYMENT" ||
                  type === "REMINDER"
                    ? "مشتری"
                    : "تلفن"}
                </th>
                {(type === "REQUEST" ||
                  type === "PAYMENT" ||
                  type === "REMINDER") && (
                  <th className="p-3 text-right font-semibold text-gray-700">
                    {type === "REQUEST"
                      ? "وضعیت"
                      : type === "PAYMENT"
                      ? "مبلغ"
                      : "تاریخ"}
                  </th>
                )}
                <th className="p-3 w-28 text-center font-semibold text-gray-700">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={type === "REMINDER" ? 3 : 4}
                    className="p-8 text-center"
                  >
                    <Loading />
                  </td>
                </tr>
              )}
              {!loading && filteredEntities.length === 0 && (
                <tr>
                  <td
                    colSpan={type === "REMINDER" ? 3 : 4}
                    className="p-4 text-center text-base-content/60"
                  >
                    موردی یافت نشد
                  </td>
                </tr>
              )}
              {!loading &&
                filteredEntities.map((entity) => (
                  <tr
                    key={entity.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-3 text-gray-500">#{entity.id}</td>
                    <td className="p-3 font-medium text-gray-900">
                      {type === "REMINDER"
                        ? entity.title || "بدون عنوان"
                        : type === "INVOICE"
                        ? `فاکتور #${entity.id}`
                        : type === "REQUEST"
                        ? entity.serviceType?.name || "نامشخص"
                        : type === "PAYMENT"
                        ? entity.type === "RECEIVE"
                          ? "دریافت"
                          : "پرداخت"
                        : entity.displayName ||
                          entity.workspaceUser?.displayName ||
                          entity.user?.name ||
                          entity.workspaceUser?.user?.name ||
                          "نامشخص"}
                    </td>
                    <td className="p-3 text-gray-600">
                      {type === "REMINDER" ||
                      type === "INVOICE" ||
                      type === "REQUEST" ||
                      type === "PAYMENT"
                        ? entity.workspaceUser?.displayName ||
                          entity.workspaceUser?.user?.name ||
                          "-"
                        : entity.user?.phone ||
                          entity.workspaceUser?.user?.phone ||
                          "-"}
                    </td>
                    {type === "REQUEST" && (
                      <td className="p-3">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                          {entity.status?.name || "-"}
                        </span>
                      </td>
                    )}
                    {type === "PAYMENT" && (
                      <td className="p-3 font-semibold text-gray-900">
                        {entity.amount?.toLocaleString("fa-IR")} ریال
                      </td>
                    )}
                    {type === "REMINDER" && (
                      <td className="p-3 text-gray-600 text-xs">
                        {new Date(entity.dueDate).toLocaleDateString("fa-IR")}
                      </td>
                    )}
                    <td className="p-3 text-center">
                      <Button
                        size="sm"
                        onClick={() => onSelect(entity)}
                        icon={<DIcon icon="fa-check" cdi={false} />}
                      >
                        انتخاب
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}
