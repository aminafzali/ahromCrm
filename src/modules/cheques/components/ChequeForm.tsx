// مسیر فایل: src/modules/cheques/components/ChequeForm.tsx

"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Input2 from "@/@Client/Components/ui/Input2";
import Select3 from "@/@Client/Components/ui/Select3";
import { useBankAccount } from "@/modules/bank-accounts/hooks/useBankAccount";
import SelectBankAccount2 from "@/modules/invoices/components/SelectBankAccount2";
import { InvoiceWithRelations } from "@/modules/invoices/types";
import { listItemRender } from "@/modules/workspace-users/data/table";
import { WorkspaceUserWithRelations } from "@/modules/workspace-users/types";
import { Button } from "ndui-ahrom";
import { useEffect, useState } from "react";
import SelectInvoice from "../../payments/components/SelectInvoice";
import SelectUser2 from "../../payments/components/SelectUser2";
import StandaloneDatePicker from "../../payments/components/StandaloneDatePicker";
import { createChequeSchema } from "../validation/schema";

interface ChequeFormProps {
  onSubmit: (data: any) => void;
  defaultValues?: any;
  loading?: boolean;
}

export default function ChequeForm({
  onSubmit,
  defaultValues = {},
  loading = false,
}: ChequeFormProps) {
  const [chequeNumber, setChequeNumber] = useState<string>(
    defaultValues.chequeNumber || ""
  );
  const [serial, setSerial] = useState<string>(defaultValues.serial || "");
  const [bankName, setBankName] = useState<string>(
    defaultValues.bankName || ""
  );
  const [branchName, setBranchName] = useState<string>(
    defaultValues.branchName || ""
  );
  const [accountNumber, setAccountNumber] = useState<string>(
    defaultValues.accountNumber || ""
  );
  const [amount, setAmount] = useState<string>(
    defaultValues.amount?.toString() || ""
  );
  const [issueDate, setIssueDate] = useState<string | null>(
    defaultValues.issueDate || new Date().toISOString()
  );
  const [dueDate, setDueDate] = useState<string | null>(
    defaultValues.dueDate || null
  );
  const [direction, setDirection] = useState<string>(
    defaultValues.direction || "INCOMING"
  );
  const [status, setStatus] = useState<string>(
    defaultValues.status || "CREATED"
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
  const [bankAccount, setBankAccount] = useState<any | null>(
    defaultValues.bankAccount || null
  );
  const [error, setError] = useState<string | null>(null);

  const { getAll: getAllBankAccounts } = useBankAccount();

  // Load default bank account when user or invoice changes
  useEffect(() => {
    const loadDefaultBankAccount = async () => {
      if (!bankAccount) {
        try {
          const accounts = await getAllBankAccounts({
            page: 1,
            limit: 100,
          });
          const accountsList = accounts.data || [];
          if (accountsList.length > 0) {
            const defaultAccount = accountsList.find(
              (acc: any) => acc.isDefaultForReceive || acc.isDefaultForPay
            );
            if (defaultAccount) {
              setBankAccount(defaultAccount);
            } else if (accountsList.length === 1) {
              setBankAccount(accountsList[0]);
            }
          }
        } catch (e) {
          console.error("Failed to load bank accounts", e);
        }
      }
    };

    loadDefaultBankAccount();
  }, [user?.id, invoice?.workspaceUser?.id]);

  const handleSubmit = () => {
    if (!user && !invoice?.workspaceUser) {
      setError("انتخاب کاربر یا فاکتور الزامی است.");
      return;
    }

    const data = {
      workspaceUser: user || invoice?.workspaceUser,
      invoiceId: invoice?.id,
      bankAccountId: bankAccount?.id,
      chequeNumber,
      serial: serial || undefined,
      bankName: bankName || undefined,
      branchName: branchName || undefined,
      accountNumber: accountNumber || undefined,
      amount: parseFloat(amount) || 0,
      issueDate: issueDate,
      dueDate: dueDate,
      direction,
      status,
      description: description || undefined,
    };

    const validation = createChequeSchema.safeParse(data);
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
                  className="w-fit text-error"
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

      {/* بخش اصلی فرم چک */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input2
            name="chequeNumber"
            label="شماره چک"
            value={chequeNumber}
            onChange={(e) => setChequeNumber(e.target.value)}
            required
          />
          <Input2
            name="serial"
            label="سری/سریال"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
          />
          <Input2
            name="bankName"
            label="نام بانک"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
          />
          <Input2
            name="branchName"
            label="نام شعبه"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
          />
          <Input2
            name="accountNumber"
            label="شماره حساب"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />
          <Input2
            name="amount"
            label="مبلغ (تومان)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <StandaloneDatePicker
            name="issueDate"
            label="تاریخ صدور"
            value={issueDate}
            onChange={(payload) => setIssueDate(payload ? payload.iso : null)}
          />
          <StandaloneDatePicker
            name="dueDate"
            label="تاریخ سررسید"
            value={dueDate}
            onChange={(payload) => setDueDate(payload ? payload.iso : null)}
          />
          <Select3
            name="direction"
            label="جهت چک"
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            options={[
              { value: "INCOMING", label: "دریافتی" },
              { value: "OUTGOING", label: "پرداختی" },
            ]}
            required
          />
          <Select3
            name="status"
            label="وضعیت"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: "CREATED", label: "ایجاد شده" },
              { value: "HANDED_OVER", label: "تحویل داده/گرفته شده" },
              { value: "DEPOSITED", label: "خوابانده شده" },
              { value: "CLEARED", label: "پاس شده" },
              { value: "RETURNED", label: "برگشتی" },
              { value: "CANCELLED", label: "باطل شده" },
              { value: "LOST", label: "مفقود شده" },
            ]}
            required
          />
          <div className="md:col-span-2">
            <label className="label">
              <span className="label-text text-sm font-medium">
                حساب بانکی (اختیاری)
              </span>
            </label>
            <div className="p-3 border rounded-lg bg-base-200/50 min-h-[70px]">
              {bankAccount ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{bankAccount.title}</p>
                    {bankAccount.bankName && (
                      <p className="text-xs text-gray-500">
                        {bankAccount.bankName}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="btn-circle btn-xs"
                    onClick={() => setBankAccount(null)}
                  >
                    <DIcon icon="fa-times" cdi={false} />
                  </Button>
                </div>
              ) : (
                <SelectBankAccount2
                  onSelect={(acc) => setBankAccount(acc)}
                  buttonProps={{ size: "sm" }}
                />
              )}
            </div>
          </div>
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
          {loading ? "در حال ثبت..." : "ثبت چک"}
        </Button>
      </div>
    </div>
  );
}
