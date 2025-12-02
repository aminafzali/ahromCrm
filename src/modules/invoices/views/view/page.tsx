"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import Button from "@/@Client/Components/ui/Button2";
import CreateChequePage from "@/modules/cheques/views/create/page";
import InvoiceItemsView from "@/modules/invoices/components/InvoiceItemsView";
import InvoiceStatusBadge from "@/modules/invoices/components/InvoiceStatusBadge";
import PaymentStatusBadge from "@/modules/invoices/components/PaymentStatusBadge";
import { useInvoice } from "@/modules/invoices/hooks/useInvoice";
import { InvoiceWithRelations } from "@/modules/invoices/types";
import CreatePaymentPage from "@/modules/payments/views/create/page";
import { InvoiceStatus, PaymentMethod, PaymentType } from "@prisma/client";
import { Card, Modal } from "ndui-ahrom";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// آبجکت‌های کمکی برای ترجمه و نمایش آیکون‌ها
const paymentTypeDetails: Record<
  PaymentType,
  { label: string; icon: string; color: string }
> = {
  RECEIVE: { label: "دریافتی", icon: "fa-arrow-down", color: "text-green-500" },
  PAY: { label: "پرداختی", icon: "fa-arrow-up", color: "text-red-500" },
};
const paymentMethodMap: Record<PaymentMethod, string> = {
  CASH: "نقد",
  CARD: "کارتخوان",
  TRANSFER: "انتقال",
  ONLINE_GATEWAY: "درگاه آنلاین",
  COD: "پرداخت در محل",
};

interface InvoiceDetailsViewProps {
  id: number;
  isAdmin: boolean;
  backUrl: string;
}

export default function DetailPage({ id, isAdmin }: InvoiceDetailsViewProps) {
  const { getById, loading, statusCode, update, submitting } = useInvoice();
  const [invoice, setInvoice] = useState<InvoiceWithRelations | null>(null);
  const [isStatusModalOpen, setStatusModalOpen] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isChequeModalOpen, setChequeModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchInvoiceDetails();
    }
  }, [id]);

  const fetchInvoiceDetails = async () => {
    try {
      const data = await getById(id);
      if (data) setInvoice(data);
    } catch (error) {
      console.error("Error fetching invoice details:", error);
    }
  };

  const handleStatusChange = async (newStatus: InvoiceStatus) => {
    if (!invoice) return;
    try {
      await update(invoice.id, { invoiceStatus: newStatus });
      toast.success("وضعیت فاکتور با موفقیت تغییر کرد.");
      fetchInvoiceDetails();
    } catch (error) {
      toast.error("خطا در تغییر وضعیت فاکتور.");
    } finally {
      setStatusModalOpen(false);
    }
  };

  const receives =
    invoice?.payments
      ?.filter((p) => p.type === "RECEIVE")
      .reduce((sum, p) => sum + p.amount, 0) || 0;
  const pays =
    invoice?.payments
      ?.filter((p) => p.type === "PAY")
      .reduce((sum, p) => sum + p.amount, 0) || 0;
  let totalPaid = 0;
  if (invoice?.type === "SALES" || invoice?.type === "RETURN_PURCHASE") {
    totalPaid = receives - pays;
  } else if (invoice?.type === "PURCHASE" || invoice?.type === "RETURN_SALES") {
    totalPaid = pays - receives;
  }
  const balanceDue = (invoice?.total || 0) - totalPaid;

  const invoiceTypeMap = {
    SALES: "فروش",
    PURCHASE: "خرید",
    PROFORMA: "پیش‌فاکتور",
    RETURN_SALES: "مرجوعی فروش",
    RETURN_PURCHASE: "مرجوعی خرید",
  };

  const paymentTypeByinvoiceTypeMap = {
    SALES: "RECEIVE",
    PURCHASE: "PAY",
    PROFORMA: "RECEIVE",
    RETURN_SALES: "PAY",
    RETURN_PURCHASE: "RECEIVE",
  };

  if (loading && !invoice) return <Loading />;
  if (statusCode === 404) return <NotFound />;
  if (!invoice) return <Loading />;

  return (
    <>
      <div className="space-y-6">
        <Card>
          <div className="p-4 flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-xl font-bold m-1">
                <span
                  className={`ml-2 px-2.5 py-1 bg-teal-100 text-teal-800 text-md ring-1 ring-teal-800 font-medium rounded-md`}
                >
                  فاکتور {invoiceTypeMap[invoice?.type] || "! نامشخص"}
                </span>
                : {invoice.invoiceNumberName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <InvoiceStatusBadge status={invoice.invoiceStatus} />
                <PaymentStatusBadge status={invoice.paymentStatus} />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <Button
                variant="primary"
                onClick={() => setPaymentModalOpen(true)}
                icon={<DIcon icon="fa-dollar-sign" cdi={false} />}
              >
                ثبت پرداخت
              </Button>
              <Button
                variant="secondary"
                onClick={() => setChequeModalOpen(true)}
                icon={<DIcon icon="fa-file-invoice" cdi={false} />}
              >
                ثبت چک
              </Button>
              <Button
                variant="ghost"
                onClick={() => setStatusModalOpen(true)}
                icon={<DIcon icon="fa-edit" cdi={false} />}
                disabled={submitting}
              >
                تغییر وضعیت
              </Button>
              {invoice.requestId && (
                <Link href={`/dashboard/requests/${invoice.requestId}`}>
                  <Button
                    variant="ghost"
                    icon={<DIcon icon="fa-eye" cdi={false} />}
                  >
                    مشاهده درخواست
                  </Button>
                </Link>
              )}
              <Link href={`/dashboard/invoices/${invoice.id}/print`}>
                <Button
                  variant="ghost"
                  icon={<DIcon icon="fa-print" cdi={false} />}
                >
                  پیش‌نمایش چاپ
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h2 className="font-semibold text-lg mb-4">اطلاعات کلی</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">مشتری:</p>
                <p className="font-medium">
                  {invoice.workspaceUser?.displayName ||
                    invoice.workspaceUser?.user.name ||
                    invoice.workspaceUser?.user.phone}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">شماره تماس:</p>
                <p className="font-medium">
                  {invoice.workspaceUser?.user.phone}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">تاریخ صدور:</p>
                <p className="font-medium">
                  <DateDisplay date={invoice.issueDate} />
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">
                  تاریخ سررسید:
                </p>
                <p className="font-medium">
                  <DateDisplay date={invoice.dueDate} />
                </p>
              </div>
              {invoice.customerBankAccount && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    حساب بانکی مشتری:
                  </p>
                  <p className="font-medium">
                    {invoice.customerBankAccount.title}
                    {invoice.customerBankAccount.bankName &&
                      ` - ${invoice.customerBankAccount.bankName}`}
                    {invoice.customerBankAccount.cardNumber && (
                      <span className="block text-xs text-gray-500">
                        کارت: {invoice.customerBankAccount.cardNumber}
                      </span>
                    )}
                    {invoice.customerBankAccount.accountNumber && (
                      <span className="block text-xs text-gray-500">
                        حساب: {invoice.customerBankAccount.accountNumber}
                      </span>
                    )}
                  </p>
                </div>
              )}
              {invoice.adminBankAccount && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    حساب بانکی ادمین:
                  </p>
                  <p className="font-medium">
                    {invoice.adminBankAccount.title}
                    {invoice.adminBankAccount.bankName &&
                      ` - ${invoice.adminBankAccount.bankName}`}
                    {invoice.adminBankAccount.cardNumber && (
                      <span className="block text-xs text-gray-500">
                        کارت: {invoice.adminBankAccount.cardNumber}
                      </span>
                    )}
                    {invoice.adminBankAccount.accountNumber && (
                      <span className="block text-xs text-gray-500">
                        حساب: {invoice.adminBankAccount.accountNumber}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <InvoiceItemsView items={invoice.items} />
        </Card>

        <Card>
          <div className="p-4">
            <h2 className="font-semibold text-lg mb-4">خلاصه مالی</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  جمع جزء:
                </span>
                <span>{invoice.subtotal.toLocaleString()} تومان</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">تخفیف:</span>
                <span className="text-red-600">
                  - {invoice.discount.toLocaleString()} تومان
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  مالیات:
                </span>
                <span>+ {invoice.tax.toLocaleString()} تومان</span>
              </div>
              <hr className="my-2 dark:border-gray-600" />
              <div className="flex justify-between font-bold text-base">
                <span>مبلغ کل:</span>
                <span>{invoice.total.toLocaleString()} تومان</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  پرداخت شده:
                </span>
                <span className="font-semibold text-green-600">
                  {totalPaid.toLocaleString()} تومان
                </span>
              </div>

              {balanceDue > 0 && (
                <div className="flex justify-between font-bold text-base bg-red-50 dark:bg-red-900/50 p-2 rounded text-red-700 dark:text-red-300">
                  <span>مانده جهت پرداخت:</span>
                  <span>{balanceDue.toLocaleString()} تومان</span>
                </div>
              )}
              {balanceDue < 0 && (
                <div className="flex justify-between font-bold text-base bg-blue-50 dark:bg-blue-900/50 p-2 rounded text-blue-700 dark:text-blue-300">
                  <span>پرداخت مازاد:</span>
                  <span>{Math.abs(balanceDue).toLocaleString()} تومان</span>
                </div>
              )}
              {balanceDue === 0 && (
                <div className="flex justify-between font-bold text-base bg-green-50 dark:bg-green-900/50 p-2 rounded text-green-700 dark:text-green-300">
                  <span>وضعیت:</span>
                  <span>تسویه شده</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {invoice.description && (
          <Card>
            <div className="p-4">
              <h2 className="font-semibold text-lg mb-4">توضیحات</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {invoice.description}
              </p>
            </div>
          </Card>
        )}

        <Card>
          <div className="p-4">
            <h2 className="font-semibold text-lg mb-4">لیست پرداخت‌ها</h2>
            {invoice.payments && invoice.payments.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {invoice.payments.map((p) => {
                  const details = paymentTypeDetails[p.type];
                  return (
                    <li
                      key={p.id}
                      className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <div className="flex items-center gap-3">
                        <i
                          className={`fa-light ${details.icon} text-lg ${details.color}`}
                        ></i>
                        <div>
                          <p className="font-medium">
                            {p.amount.toLocaleString()} تومان
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {details.label} - {paymentMethodMap[p.method]}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <DateDisplay date={p.createdAt} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                هیچ پرداختی ثبت نشده است.
              </p>
            )}
          </div>
        </Card>

        {/* <Card>
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start border-b pb-4 mb-4 gap-4">
              <div>
                <h2 className="text-2xl font-bold">فاکتور فروش</h2>
                <p className="text-gray-500">{invoice.invoiceNumberName}</p>
              </div>
              <div className="text-left md:text-right w-full md:w-auto text-sm">
                <p>
                  <strong>تاریخ صدور:</strong>{" "}
                  <DateDisplay date={invoice.issueDate} />
                </p>
                <p>
                  <strong>تاریخ سررسید:</strong>{" "}
                  <DateDisplay date={invoice.dueDate} />
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 text-sm">
              <div>
                <h3 className="font-semibold mb-2">فروشنده:</h3>
                <p>نام شرکت شما</p>
                <p>آدرس شما</p>
                <p>تلفن شما</p>
              </div>
              <div className="text-left md:text-right">
                <h3 className="font-semibold mb-2">خریدار:</h3>
                <p>
                  {invoice.workspaceUser?.displayName ||
                    invoice.workspaceUser?.user.name}
                </p>
                <p>{invoice.workspaceUser?.user.address}</p>
                <p>{invoice.workspaceUser?.user.phone}</p>
              </div>
            </div>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="p-2 text-right">#</th>
                    <th className="p-2 text-right">کالا/خدمت</th>
                    <th className="p-2 text-center">تعداد</th>
                    <th className="p-2 text-center">قیمت واحد</th>
                    <th className="p-2 text-left">مبلغ کل</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, i) => (
                    <tr key={item.id} className="border-b dark:border-gray-700">
                      <td className="p-2">{i + 1}</td>
                      <td className="p-2 font-medium">{item.itemName}</td>
                      <td className="p-2 text-center">{item.quantity}</td>
                      <td className="p-2 text-center">
                        {item.unitPrice.toLocaleString()}
                      </td>
                      <td className="p-2 text-left font-semibold">
                        {item.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="font-bold bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <td
                      colSpan={4}
                      className="p-2 text-left border-t dark:border-gray-700"
                    >
                      جمع جزء:
                    </td>
                    <td className="p-2 text-left border-t dark:border-gray-700">
                      {invoice.subtotal.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="p-2 text-left">
                      تخفیف:
                    </td>
                    <td className="p-2 text-left">
                      {invoice.discount.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="p-2 text-left">
                      مالیات:
                    </td>
                    <td className="p-2 text-left">
                      {invoice.tax.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="bg-gray-100 dark:bg-gray-900 text-lg">
                    <td colSpan={4} className="p-3 text-left">
                      مبلغ نهایی:
                    </td>
                    <td className="p-3 text-left">
                      {invoice.total.toLocaleString()} تومان
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="border-t mt-8 pt-4 text-xs text-gray-500 text-center">
              <p>مهر و امضا</p>
            </div>
          </div>
        </Card> */}
      </div>

      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="تغییر وضعیت فاکتور"
      >
        <div className="p-4 space-y-3">
          <p>وضعیت جدید را انتخاب کنید:</p>
          <div className="flex flex-col gap-2">
            <Button
              variant="primary"
              outline
              onClick={() => handleStatusChange("APPROVED")}
              disabled={submitting || invoice.invoiceStatus === "APPROVED"}
            >
              تایید شده
            </Button>
            <Button
              variant="warning"
              outline
              onClick={() => handleStatusChange("PENDING")}
              disabled={submitting || invoice.invoiceStatus === "PENDING"}
            >
              در انتظار تایید
            </Button>
            <Button
              variant="error"
              outline
              onClick={() => handleStatusChange("CANCELED")}
              disabled={submitting || invoice.invoiceStatus === "CANCELED"}
            >
              لغو شده
            </Button>
            <Button variant="ghost" onClick={() => setStatusModalOpen(false)}>
              انصراف
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="ثبت پرداخت جدید"
        size="2xl"
      >
        <CreatePaymentPage
          defaultValues={{
            invoice: invoice,
            workspaceUser: invoice.workspaceUser,
            amount: balanceDue > 0 ? balanceDue : 0,
            type: paymentTypeByinvoiceTypeMap[invoice.type],
          }}
          back={false}
          after={() => {
            setPaymentModalOpen(false);
            fetchInvoiceDetails();
          }}
        />
      </Modal>

      <Modal
        isOpen={isChequeModalOpen}
        onClose={() => setChequeModalOpen(false)}
        title="ثبت چک جدید"
        size="2xl"
      >
        <CreateChequePage
          defaultValues={{
            invoice: invoice,
            workspaceUser: invoice.workspaceUser,
            amount: balanceDue > 0 ? balanceDue : 0,
            direction:
              paymentTypeByinvoiceTypeMap[invoice.type] === "RECEIVE"
                ? "INCOMING"
                : "OUTGOING",
          }}
          back={false}
          after={() => {
            setChequeModalOpen(false);
            fetchInvoiceDetails();
          }}
        />
      </Modal>
    </>
  );
}
