// مسیر فایل: src/modules/payments/components/PaymentForm.tsx

"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Select22 from "@/@Client/Components/wrappers/Select22";
import { InvoiceWithRelations } from "@/modules/invoices/types";
import PaymentCategorySelect2 from "@/modules/payment-categories/components/PaymentCategorySelect2";
import { listItemRender } from "@/modules/workspace-users/data/table";
import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
import { Button } from "ndui-ahrom";
import { useState } from "react";
import { createPaymentSchema } from "../validation/schema";
import SelectInvoice from "./SelectInvoice";
import SelectUser2 from "./SelectUser2";
import Input2 from "@/@Client/Components/ui/Input2";

interface PaymentFormProps {
  onSubmit: (data: any) => void;
  defaultValues?: any;
  loading?: boolean;
}

export default function PaymentForm({
  onSubmit,
  defaultValues = {},
  loading = false,
}: PaymentFormProps) {
  const [amount, setAmount] = useState<string>(
    defaultValues.amount?.toString() || ""
  );
  const [method, setMethod] = useState<string>(defaultValues.method || "CARD");
  const [type, setType] = useState<string>(defaultValues.type || "RECEIVE");
  const [status, setStatus] = useState<string>(
    defaultValues.status || "SUCCESS"
  );
  const [reference, setReference] = useState<string>(
    defaultValues.reference || ""
  );
  const [description, setDescription] = useState<string>(
    defaultValues.description || ""
  );
  const [invoice, setInvoice] = useState<InvoiceWithRelations | null>(
    defaultValues.invoice || null
  );
  const [user, setUser] = useState<WorkspaceUserWithRelations | null>(
    defaultValues.workspaceUser || null
  );
  const [paymentCategoryId, setPaymentCategoryId] = useState<
    number | undefined
  >(defaultValues.paymentCategoryId || undefined);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const data = {
      amount: parseFloat(amount) || 0,
      method,
      type,
      status,
      reference,
      description,
      workspaceUser: user,
      paymentCategoryId: paymentCategoryId,
    };
    if (invoice) {
      data["invoiceId"] = invoice.id;
    }
    const validation = createPaymentSchema.safeParse(data);
    if (!validation.success) {
      const errorMessages = Object.values(
        validation.error.flatten().fieldErrors
      )
        .flat()
        .join(" | ");
      setError(errorMessages || "لطفاً تمام موارد را به درستی تکمیل کنید");
      return;
    }

    setError(null);
    onSubmit(validation.data);
  };

  const handleRemoveInvoice = () => {
    setInvoice(null);
    setUser(null);
    setAmount("");
  };

  const handleRemoveUser = () => {
    setUser(null);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* بخش انتخاب کاربر و فاکتور */}
      <div className="p-4 border dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
        <h3 className="font-semibold mb-4 text-slate-800 dark:text-slate-200">
          اطلاعات پایه
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-2 flex flex-col gap-4">
            <div className="flex gap-2">
              {!invoice && (
                <SelectInvoice
                  onSelect={(selectedInvoice) => {
                    setInvoice(selectedInvoice);
                    if (selectedInvoice.workspaceUser) {
                      setUser(selectedInvoice.workspaceUser);
                    }
                    setAmount(selectedInvoice.total.toString());
                  }}
                />
              )}
              {invoice && (
                <Button
                  className="w-fit text-error"
                  variant="ghost"
                  onClick={handleRemoveInvoice}
                >
                  حذف فاکتور
                </Button>
              )}
            </div>
            {invoice && (
              <div>
                فاکتور شماره {invoice.id} به مبلغ{" "}
                {invoice.total.toLocaleString()} تومان انتخاب شد.
              </div>
            )}
          </div>
          <div className="p-2 flex flex-col gap-4">
            <div className="flex gap-2">
              {!invoice && !user && <SelectUser2 onSelect={setUser} />}
              {user && !invoice && (
                <Button
                  className="w-fit text-error "
                  variant="ghost"
                  onClick={handleRemoveUser}
                >
                  حذف کاربر
                </Button>
              )}
            </div>
            {user && listItemRender(user)}
          </div>
        </div>
      </div>

      {/* بخش اصلی فرم پرداخت */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* <PaymentCategorySelect2
            label="دسته‌بندی پرداخت (اختیاری)"
            value={paymentCategoryId}
            // پارامتر ورودی 'selectedValue' دیگر یک رویداد نیست،
            // بلکه خود مقدار نهایی است
            onChange={(selectedValue) => {
              setPaymentCategoryId(selectedValue);
            }}
          /> */}
          <div className="md:col-span-1">
            <PaymentCategorySelect2
              name="paymentCategoryId"
              label="دسته‌بندی پرداخت (اختیاری)"
              value={paymentCategoryId}
              onChange={(e) => {
                const valueAsNumber = Number(e.target.value);
                setPaymentCategoryId(
                  isNaN(valueAsNumber) ? undefined : valueAsNumber
                );
              }}
            />
          </div>
          <Input2
            name="amount"
            label="مبلغ (تومان)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <Select22
            name="method"
            label="روش پرداخت"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            options={[
              { value: "CASH", label: "نقدی" },
              { value: "CARD", label: "کارتخوان" },
              { value: "TRANSFER", label: "انتقال" },
            ]}
            required
          />
          <Select22
            name="type"
            label="نوع تراکنش"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: "RECEIVE", label: "دریافت" },
              { value: "PAY", label: "پرداخت" },
            ]}
            required
          />
          <Select22
            name="status"
            label="وضعیت"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: "PENDING", label: "در انتظار تایید" },
              { value: "SUCCESS", label: "موفق" },
              { value: "FAILED", label: "ناموفق" },
            ]}
            required
          />
          <Input2
            name="reference"
            label="شماره پیگیری"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
          <div className="md:col-span-2">
            <Input2
              name="description"
              label="توضیحات"
              type="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button
          type="button"
          disabled={loading}
          onClick={handleSubmit}
          loading={loading}
          icon={<DIcon icon="fa-check" cdi={false} classCustom="ml-2" />}
        >
          {loading ? "در حال ثبت..." : "ثبت پرداخت"}
        </Button>
      </div>
    </div>
  );
}
