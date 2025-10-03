// مسیر فایل: src/modules/reminders/components/SubjectSelector.tsx
"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import { useInvoice } from "@/modules/invoices/hooks/useInvoice";
import { useRequest } from "@/modules/requests/hooks/useRequest";
import { useTask } from "@/modules/tasks/hooks/useTask";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { Button, Card, Input, Modal } from "ndui-ahrom";
import { useEffect, useState } from "react";

interface SubjectSelectorProps {
  onSubjectSelect: (
    subject: {
      type: "REQUEST" | "INVOICE" | "USER" | "TASK" | "GENERAL";
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
    "REQUEST" | "INVOICE" | "USER" | "TASK" | "GENERAL" | null
  >(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleTypeSelect = (
    type: "REQUEST" | "INVOICE" | "USER" | "TASK" | "GENERAL"
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
          این یادآور برای چیست؟ (اختیاری)
        </label>
        <p className="text-xs text-base-content/60 mb-3">
          موضوع یادآور را مشخص کنید تا بدانید این یادآور به چه چیزی مرتبط است.
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
              onClick={() => handleTypeSelect("USER")}
              icon={<DIcon icon="fa-user" cdi={false} />}
            >
              کاربر
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleTypeSelect("TASK")}
              icon={<DIcon icon="fa-tasks" cdi={false} />}
            >
              وظیفه
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
                        : selectedSubject.type === "USER"
                        ? "fa-user"
                        : selectedSubject.type === "TASK"
                        ? "fa-tasks"
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
                    {selectedSubject.type === "USER" &&
                      (selectedSubject.entity?.displayName ||
                        selectedSubject.entity?.user?.name ||
                        "کاربر")}
                    {selectedSubject.type === "TASK" &&
                      (selectedSubject.entity?.title || "وظیفه")}
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
  type: "REQUEST" | "INVOICE" | "USER" | "TASK";
}

function EntityPicker({ isOpen, onClose, onSelect, type }: EntityPickerProps) {
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { getAll: getAllRequests } = useRequest();
  const { getAll: getAllInvoices } = useInvoice();
  const { getAll: getAllUsers } = useWorkspaceUser();
  const { getAll: getAllTasks } = useTask();

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
        result = await getAllRequests({ page: 1, limit: 1000 });
      } else if (type === "INVOICE") {
        result = await getAllInvoices({ page: 1, limit: 1000 });
      } else if (type === "USER") {
        result = await getAllUsers({ page: 1, limit: 1000 });
      } else if (type === "TASK") {
        result = await getAllTasks({ page: 1, limit: 1000 });
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
    } else if (type === "USER") {
      return (
        entity.displayName?.toLowerCase().includes(q) ||
        entity.user?.name?.toLowerCase().includes(q) ||
        entity.user?.phone?.includes(q)
      );
    } else if (type === "TASK") {
      return (
        entity.title?.toLowerCase().includes(q) ||
        entity.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getTitle = () => {
    if (type === "REQUEST") return "انتخاب درخواست";
    if (type === "INVOICE") return "انتخاب فاکتور";
    if (type === "USER") return "انتخاب کاربر";
    if (type === "TASK") return "انتخاب وظیفه";
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
                  {type === "TASK"
                    ? "عنوان"
                    : type === "INVOICE"
                    ? "شماره فاکتور"
                    : type === "REQUEST"
                    ? "نوع درخواست"
                    : "نام"}
                </th>
                <th className="p-3 text-right font-semibold text-gray-700">
                  {type === "INVOICE" || type === "REQUEST"
                    ? "مشتری"
                    : type === "TASK"
                    ? "تاریخ"
                    : "تلفن"}
                </th>
                {type === "REQUEST" && (
                  <th className="p-3 text-right font-semibold text-gray-700">
                    وضعیت
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
                    colSpan={type === "TASK" ? 3 : 4}
                    className="p-8 text-center"
                  >
                    <Loading />
                  </td>
                </tr>
              )}
              {!loading && filteredEntities.length === 0 && (
                <tr>
                  <td
                    colSpan={type === "TASK" ? 3 : 4}
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
                      {type === "TASK"
                        ? entity.title || "بدون عنوان"
                        : type === "INVOICE"
                        ? `فاکتور #${entity.id}`
                        : type === "REQUEST"
                        ? entity.serviceType?.name || "نامشخص"
                        : entity.displayName ||
                          entity.workspaceUser?.displayName ||
                          entity.user?.name ||
                          entity.workspaceUser?.user?.name ||
                          "نامشخص"}
                    </td>
                    <td className="p-3 text-gray-600">
                      {type === "TASK"
                        ? new Date(entity.dueDate).toLocaleDateString("fa-IR")
                        : type === "INVOICE" || type === "REQUEST"
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
