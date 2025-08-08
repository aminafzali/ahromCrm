// مسیر فایل: src/modules/reminders/components/ReminderForm.tsx

"use client";

import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
import { columnsForAdmin as invoiceColumns } from "@/modules/invoices/data/table";
import { InvoiceRepository } from "@/modules/invoices/repo/InvoiceRepository";
import { columnsForAdmin as requestColumns } from "@/modules/requests/data/table";
import { RequestRepository } from "@/modules/requests/repo/RequestRepository";
import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "ndui-ahrom";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useReminder } from "../hooks/useReminder";
import { createReminderSchema } from "../validation/schema";
import SelectUserForReminder from "./SelectUserForReminder";

export default function ReminderForm() {
  const router = useRouter();
  const { create, submitting } = useReminder();

  const [modalContent, setModalContent] = useState<{
    type: "requests" | "invoices";
  } | null>(null);
  const [selectedUser, setSelectedUser] =
    useState<WorkspaceUserWithRelations | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<{
    type: string;
    id: number;
    name: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    control,
  } = useForm<z.infer<typeof createReminderSchema>>({
    resolver: zodResolver(createReminderSchema),
  });

  const handleUserSelect = (user: WorkspaceUserWithRelations) => {
    setSelectedUser(user);
    setValue("workspaceUserId", user.id, { shouldValidate: true });
  };

  const openEntitySelector = (type: "requests" | "invoices") => {
    setModalContent({ type });
  };

  const handleEntitySelect = (entity: any) => {
    const entityType =
      modalContent?.type === "requests" ? "Request" : "Invoice";
    const entityName = entity.title || `شماره ${entity.id}`;
    setSelectedEntity({ type: entityType, id: entity.id, name: entityName });
    setValue("entityId", entity.id, { shouldValidate: true });
    setValue("entityType", entityType, { shouldValidate: true });
    // ++ همچنین مقدار فیلد type را نیز ست می‌کنیم ++
    setValue("type", entityType);
    setModalContent(null);
  };

  const handleSave = async (data: z.infer<typeof createReminderSchema>) => {
    const result = await create(data);
    if (result) {
      router.push("/dashboard/reminders");
    }
  };

  const renderModalContent = () => {
    if (!modalContent) return null;
    const config =
      modalContent.type === "requests"
        ? { repo: new RequestRepository(), columns: requestColumns }
        : { repo: new InvoiceRepository(), columns: invoiceColumns };
    return (
      <IndexWrapper
        columns={config.columns}
        repo={config.repo}
        selectionMode="single"
        onSelect={handleEntitySelect}
        createUrl={false}
        showIconViews={false}
        defaultViewMode="table"
      />
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleSave)} noValidate>
        <div className="row g-3">
          <div className="col-12">
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                عنوان یادآور <span className="text-danger">*</span>
              </label>
              <input
                id="title"
                type="text"
                className={`form-control ${errors.title ? "is-invalid" : ""}`}
                {...register("title")}
              />
              <div className="invalid-feedback">{errors.title?.message}</div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">
                برای کاربر <span className="text-danger">*</span>
              </label>
              <SelectUserForReminder
                onSelect={handleUserSelect}
                selectedUserName={
                  selectedUser?.displayName || selectedUser?.phone
                }
              />
              {errors.workspaceUserId && (
                <p className="text-danger mt-1 small">
                  {errors.workspaceUserId?.message}
                </p>
              )}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="dueDate" className="form-label">
                تاریخ و زمان یادآوری <span className="text-danger">*</span>
              </label>
              <input
                id="dueDate"
                type="datetime-local"
                className={`form-control ${errors.dueDate ? "is-invalid" : ""}`}
                {...register("dueDate")}
              />
              <div className="invalid-feedback">{errors.dueDate?.message}</div>
            </div>
          </div>

          <div className="col-12">
            <div className="border-top pt-3">
              <h5 className="form-label">لینک به (اختیاری)</h5>
              <p className="text-muted small">
                می‌توانید این یادآور را به یک درخواست یا فاکتور خاص متصل کنید.
              </p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">آیتم انتخاب شده</label>
              <input
                type="text"
                className="form-control"
                readOnly
                value={
                  selectedEntity
                    ? `${
                        selectedEntity.type === "Request" ? "درخواست" : "فاکتور"
                      } #${selectedEntity.id}`
                    : "موردی انتخاب نشده"
                }
              />
            </div>
          </div>
          <div className="col-md-6 d-flex align-items-end gap-2">
            <button
              type="button"
              className="btn btn-outline-info w-100"
              onClick={() => openEntitySelector("requests")}
            >
              انتخاب درخواست
            </button>
            <button
              type="button"
              className="btn btn-outline-success w-100"
              onClick={() => openEntitySelector("invoices")}
            >
              انتخاب فاکتور
            </button>
          </div>

          <div className="col-12">
            <div className="form-group">
              <label htmlFor="description" className="form-label">
                توضیحات (اختیاری)
              </label>
              <textarea
                id="description"
                className="form-control"
                rows={4}
                {...register("description")}
              ></textarea>
            </div>
          </div>
        </div>
        <div className="d-flex justify-content-end gap-2 pt-4 mt-4 border-top">
          <button
            type="button"
            className="btn btn-light"
            onClick={() => router.back()}
            disabled={submitting}
          >
            انصراف
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  aria-hidden="true"
                ></span>{" "}
                در حال ذخیره...
              </>
            ) : (
              "ایجاد یادآور"
            )}
          </button>
        </div>
      </form>

      <Modal
        size="2xl"
        isOpen={!!modalContent}
        onClose={() => setModalContent(null)}
        title={`انتخاب ${
          modalContent?.type === "requests" ? "درخواست" : "فاکتور"
        }`}
      >
        {renderModalContent()}
      </Modal>
    </>
  );
}
