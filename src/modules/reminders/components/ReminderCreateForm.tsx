// مسیر فایل: src/modules/reminders/components/ReminderCreateForm.tsx

"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
import { columnsForAdmin as invoiceColumns } from "@/modules/invoices/data/table"; // ** اصلاحیه **
import { InvoiceRepository } from "@/modules/invoices/repo/InvoiceRepository";
import { columnsForAdmin as requestColumns } from "@/modules/requests/data/table"; // ** اصلاحیه **
import { RequestRepository } from "@/modules/requests/repo/RequestRepository";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { z } from "zod";
import { useReminder } from "../hooks/useReminder";
import { createReminderSchema } from "../validation/schema";

// کامپوننت داخلی برای مرحله آخر (فرم جزئیات)
function DetailsForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <div className="space-y-4">
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
        {errors.title && (
          <div className="invalid-feedback">
            {errors.title.message as string}
          </div>
        )}
      </div>
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
        {errors.dueDate && (
          <div className="invalid-feedback">
            {errors.dueDate.message as string}
          </div>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="notificationChannels" className="form-label">
          ارسال از طریق
        </label>
        <select
          id="notificationChannels"
          className="form-select"
          {...register("notificationChannels")}
        >
          <option value="ALL">همه کانال‌ها</option>
          <option value="IN_APP">داخل برنامه</option>
          <option value="SMS">پیامک</option>
          <option value="EMAIL">ایمیل</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="description" className="form-label">
          توضیحات (اختیاری)
        </label>
        <textarea
          id="description"
          className="form-control"
          rows={3}
          {...register("description")}
        ></textarea>
      </div>
    </div>
  );
}

// کامپوننت اصلی فرم
export default function ReminderCreateForm() {
  const router = useRouter();
  const { create, submitting } = useReminder();
  const [currentStep, setCurrentStep] = useState(0); // 0: انتخاب ماژول, 1: انتخاب آیتم, 2: فرم جزئیات
  const [selectedModule, setSelectedModule] = useState<
    "requests" | "invoices" | null
  >(null);

  const methods = useForm<z.infer<typeof createReminderSchema>>({
    resolver: zodResolver(createReminderSchema),
  });
  const { handleSubmit, setValue } = methods;

  const handleModuleSelect = (module: "requests" | "invoices") => {
    setSelectedModule(module);
    setValue("entityType", module === "requests" ? "Request" : "Invoice");
    setCurrentStep(1);
  };

  const handleEntitySelect = (selectedItems: any[]) => {
    if (selectedItems && selectedItems.length > 0) {
      const entity = selectedItems[0];
      setValue("entityId", entity.id);
      setValue("userId", entity.userId);
      setCurrentStep(2);
    }
  };

  const handleSave = async (data: z.infer<typeof createReminderSchema>) => {
    const result = await create(data);
    if (result) {
      router.push("/dashboard/reminders");
    }
  };

  const moduleOptions = [
    { name: "درخواست‌ها", slug: "requests", icon: "fa-file-alt" },
    { name: "فاکتورها", slug: "invoices", icon: "fa-file-invoice-dollar" },
  ];

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: // انتخاب ماژول
        return (
          <div className="text-center">
            <h5 className="mb-4">قصد دارید برای کدام بخش یادآور بسازید؟</h5>
            <div className="d-grid gap-3 d-md-flex justify-content-md-center">
              {moduleOptions.map((module) => (
                <button
                  key={module.slug}
                  type="button"
                  className="btn btn-outline-primary btn-lg"
                  onClick={() => handleModuleSelect(module.slug as any)}
                >
                  {/* ** اصلاحیه: استفاده از classCustom ** */}
                  <DIcon icon={module.icon} cdi={false} classCustom="me-2" />
                  {module.name}
                </button>
              ))}
            </div>
          </div>
        );
      case 1: // انتخاب آیتم
        const config =
          selectedModule === "requests"
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
      case 2: // فرم جزئیات
        return <DetailsForm />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleSave)} noValidate>
        {renderCurrentStep()}
        <div className="d-flex justify-content-end gap-2 pt-4 mt-4 border-top">
          {currentStep > 0 && (
            <button
              type="button"
              className="btn btn-light"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={submitting}
            >
              مرحله قبل
            </button>
          )}
          {currentStep === 2 && (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "در حال ذخیره..." : "ایجاد یادآور"}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
