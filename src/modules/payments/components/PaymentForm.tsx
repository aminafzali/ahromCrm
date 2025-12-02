// مسیر فایل: src/modules/payments/components/PaymentForm.tsx

"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Input2 from "@/@Client/Components/ui/Input2";
import { useBankAccount } from "@/modules/bank-accounts/hooks/useBankAccount";
import SelectBankAccount2 from "@/modules/invoices/components/SelectBankAccount2";
import { InvoiceWithRelations } from "@/modules/invoices/types";
import PaymentCategorySelect2 from "@/modules/payment-categories/components/PaymentCategorySelect2";
import { listItemRender } from "@/modules/workspace-users/data/table";
import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
import { Button } from "ndui-ahrom";
import { useEffect, useState } from "react";
import { createPaymentSchema } from "../validation/schema";
import SelectInvoice from "./SelectInvoice";
import SelectUser2 from "./SelectUser2";
// کامپوننت تقویم را وارد می‌کنیم
import Select3 from "@/@Client/Components/ui/Select3";
import StandaloneDatePicker from "../components/StandaloneDatePicker";

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
  const [customerBankAccount, setCustomerBankAccount] = useState<any | null>(
    defaultValues.customerBankAccount || null
  );
  const [adminBankAccount, setAdminBankAccount] = useState<any | null>(
    defaultValues.adminBankAccount || null
  );

  // ===>>> ۱. State جدید برای نگهداری تاریخ پرداخت <<<===
  // تاریخ امروز به عنوان مقدار پیش‌فرض در نظر گرفته می‌شود
  const [paidAt, setPaidAt] = useState<string | null>(
    defaultValues.paidAt || new Date().toISOString()
  );

  const { getAll: getAllBankAccounts } = useBankAccount();

  // Load default bank accounts when user or invoice changes
  useEffect(() => {
    const loadDefaultBankAccounts = async () => {
      const targetUser = invoice?.workspaceUser || user;
      if (!targetUser?.id) {
        setCustomerBankAccount(null);
        return;
      }

      try {
        // Load customer bank accounts
        const customerAccounts = await getAllBankAccounts({
          page: 1,
          limit: 100,
          workspaceUserId: targetUser.id,
        });
        const customerAccountsList = customerAccounts.data || [];

        // Auto-select default customer account
        if (!customerBankAccount && customerAccountsList.length > 0) {
          const defaultCustomer = customerAccountsList.find(
            (acc: any) => acc.isDefaultForReceive || acc.isDefaultForPay
          );
          if (defaultCustomer) {
            setCustomerBankAccount(defaultCustomer);
          } else if (customerAccountsList.length === 1) {
            setCustomerBankAccount(customerAccountsList[0]);
          }
        }

        // Load admin bank accounts (default for receive/pay)
        const adminAccounts = await getAllBankAccounts({
          page: 1,
          limit: 100,
        });
        const adminAccountsList = adminAccounts.data || [];

        // Auto-select default admin account
        if (!adminBankAccount && adminAccountsList.length > 0) {
          const defaultAdmin = adminAccountsList.find(
            (acc: any) =>
              (type === "RECEIVE" && acc.isDefaultForReceive) ||
              (type === "PAY" && acc.isDefaultForPay)
          );
          if (defaultAdmin) {
            setAdminBankAccount(defaultAdmin);
          } else {
            // Fallback: find any default account
            const anyDefault = adminAccountsList.find(
              (acc: any) => acc.isDefaultForReceive || acc.isDefaultForPay
            );
            if (anyDefault) {
              setAdminBankAccount(anyDefault);
            } else if (adminAccountsList.length === 1) {
              setAdminBankAccount(adminAccountsList[0]);
            }
          }
        }
      } catch (e) {
        console.error("Failed to load bank accounts", e);
      }
    };

    loadDefaultBankAccounts();
  }, [user?.id, invoice?.workspaceUser?.id, type]);

  const handleSubmit = () => {
    if (!customerBankAccount) {
      setError("انتخاب حساب بانکی مشتری الزامی است.");
      return;
    }
    if (!adminBankAccount) {
      setError("انتخاب حساب بانکی ادمین الزامی است.");
      return;
    }

    const data = {
      amount: parseFloat(amount) || 0,
      method,
      type,
      status,
      reference,
      description,
      workspaceUser: user || invoice?.workspaceUser,
      paymentCategoryId: paymentCategoryId,
      // ===>>> ۳. افزودن تاریخ به داده‌های نهایی برای ارسال <<<===
      paidAt: paidAt,
      customerBankAccountId: customerBankAccount.id,
      adminBankAccountId: adminBankAccount.id,
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
          {/* ===>>> ۲. افزودن کامپوننت تقویم به فرم <<<=== */}
          <StandaloneDatePicker
            name="paidAt"
            label="تاریخ پرداخت"
            value={paidAt}
            onChange={(payload) => setPaidAt(payload ? payload.iso : null)}
          />

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
          <Select3
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
          <Select3
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
          <Select3
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

          {/* حساب‌های بانکی */}
          <div className="md:col-span-2">
            <h3 className="font-semibold mb-4 text-slate-800 dark:text-slate-200">
              حساب‌های بانکی
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <span className="label-text text-sm font-medium">
                    حساب بانکی مشتری <span className="text-red-500">*</span>
                  </span>
                </label>
                <div className="p-3 border rounded-lg bg-base-200/50 min-h-[70px]">
                  {customerBankAccount ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {customerBankAccount.title}
                        </p>
                        {customerBankAccount.bankName && (
                          <p className="text-xs text-gray-500">
                            {customerBankAccount.bankName}
                          </p>
                        )}
                        {customerBankAccount.cardNumber && (
                          <p className="text-xs text-gray-500">
                            کارت: {customerBankAccount.cardNumber}
                          </p>
                        )}
                        {customerBankAccount.accountNumber && (
                          <p className="text-xs text-gray-500">
                            حساب: {customerBankAccount.accountNumber}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="btn-circle btn-xs"
                        onClick={() => setCustomerBankAccount(null)}
                      >
                        <DIcon icon="fa-times" cdi={false} />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <SelectBankAccount2
                        onSelect={(acc) => setCustomerBankAccount(acc)}
                        workspaceUserId={
                          invoice?.workspaceUser?.id || user?.id
                        }
                        buttonProps={{ size: "sm" }}
                      />
                      {(invoice?.workspaceUser?.id || user?.id) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            window.open(
                              `/dashboard/bank-accounts/create?workspaceUserId=${
                                invoice?.workspaceUser?.id || user?.id
                              }`,
                              "_blank"
                            );
                          }}
                        >
                          <DIcon icon="fa-plus" cdi={false} /> ایجاد حساب جدید
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="label">
                  <span className="label-text text-sm font-medium">
                    حساب بانکی ادمین <span className="text-red-500">*</span>
                  </span>
                </label>
                <div className="p-3 border rounded-lg bg-base-200/50 min-h-[70px]">
                  {adminBankAccount ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{adminBankAccount.title}</p>
                        {adminBankAccount.bankName && (
                          <p className="text-xs text-gray-500">
                            {adminBankAccount.bankName}
                          </p>
                        )}
                        {adminBankAccount.cardNumber && (
                          <p className="text-xs text-gray-500">
                            کارت: {adminBankAccount.cardNumber}
                          </p>
                        )}
                        {adminBankAccount.accountNumber && (
                          <p className="text-xs text-gray-500">
                            حساب: {adminBankAccount.accountNumber}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="btn-circle btn-xs"
                        onClick={() => setAdminBankAccount(null)}
                      >
                        <DIcon icon="fa-times" cdi={false} />
                      </Button>
                    </div>
                  ) : (
                    <SelectBankAccount2
                      onSelect={(acc) => setAdminBankAccount(acc)}
                      filterDefault={true}
                      buttonProps={{ size: "sm" }}
                    />
                  )}
                </div>
              </div>
            </div>
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
