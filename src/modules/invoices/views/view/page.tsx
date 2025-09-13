"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import Button from "@/@Client/Components/ui/Button2";
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

  if (loading && !invoice) return <Loading />;
  if (statusCode === 404) return <NotFound />;
  if (!invoice) return <Loading />;

  return (
    <>
      <div className="space-y-6">
        <Card>
          <div className="p-4 flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-xl font-bold">
                جزئیات فاکتور: {invoice.invoiceNumberName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
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
          }}
          back={false}
          after={() => {
            setPaymentModalOpen(false);
            fetchInvoiceDetails();
          }}
        />
      </Modal>
    </>
  );
}

// "use client";

// import DIcon from "@/@Client/Components/common/DIcon";
// import Loading from "@/@Client/Components/common/Loading";
// import NotFound from "@/@Client/Components/common/NotFound";
// import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
// import Button from "@/@Client/Components/ui/Button2";
// import InvoiceItemsView from "@/modules/invoices/components/InvoiceItemsView";
// import InvoiceStatusBadge from "@/modules/invoices/components/InvoiceStatusBadge";
// import PaymentStatusBadge from "@/modules/invoices/components/PaymentStatusBadge";
// import { useInvoice } from "@/modules/invoices/hooks/useInvoice";
// import { InvoiceWithRelations } from "@/modules/invoices/types";
// import CreatePaymentPage from "@/modules/payments/views/create/page";
// import { InvoiceStatus, PaymentMethod, PaymentType } from "@prisma/client";
// import { Card, Modal } from "ndui-ahrom";
// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { toast } from "react-toastify";

// // آبجکت‌های کمکی برای ترجمه و نمایش آیکون‌ها
// const paymentTypeDetails: Record<
//   PaymentType,
//   { label: string; icon: string; color: string }
// > = {
//   RECEIVE: { label: "دریافتی", icon: "fa-arrow-down", color: "text-green-500" },
//   PAY: { label: "پرداختی", icon: "fa-arrow-up", color: "text-red-500" },
// };
// const paymentMethodMap: Record<PaymentMethod, string> = {
//   CASH: "نقد",
//   CARD: "کارتخوان",
//   TRANSFER: "انتقال",
// };

// interface InvoiceDetailsViewProps {
//   id: number;
//   isAdmin: boolean;
//   backUrl: string;
// }

// export default function DetailPage({ id, isAdmin }: InvoiceDetailsViewProps) {
//   const { getById, loading, statusCode, update, submitting } = useInvoice();
//   const [invoice, setInvoice] = useState<InvoiceWithRelations | null>(null);
//   const [isStatusModalOpen, setStatusModalOpen] = useState(false);
//   const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

//   useEffect(() => {
//     if (id) {
//       fetchInvoiceDetails();
//     }
//   }, [id]);

//   const fetchInvoiceDetails = async () => {
//     try {
//       const data = await getById(id);
//       if (data) setInvoice(data);
//     } catch (error) {
//       console.error("Error fetching invoice details:", error);
//     }
//   };

//   const handleStatusChange = async (newStatus: InvoiceStatus) => {
//     if (!invoice) return;
//     try {
//       await update(invoice.id, { invoiceStatus: newStatus });
//       toast.success("وضعیت فاکتور با موفقیت تغییر کرد.");
//       fetchInvoiceDetails();
//     } catch (error) {
//       toast.error("خطا در تغییر وضعیت فاکتور.");
//     } finally {
//       setStatusModalOpen(false);
//     }
//   };

//   const receives =
//     invoice?.payments
//       ?.filter((p) => p.type === "RECEIVE")
//       .reduce((sum, p) => sum + p.amount, 0) || 0;
//   const pays =
//     invoice?.payments
//       ?.filter((p) => p.type === "PAY")
//       .reduce((sum, p) => sum + p.amount, 0) || 0;
//   let totalPaid = 0;
//   if (invoice?.type === "SALES" || invoice?.type === "RETURN_PURCHASE") {
//     totalPaid = receives - pays;
//   } else if (invoice?.type === "PURCHASE" || invoice?.type === "RETURN_SALES") {
//     totalPaid = pays - receives;
//   }
//   const balanceDue = (invoice?.total || 0) - totalPaid;

//   if (loading && !invoice) return <Loading />;
//   if (statusCode === 404) return <NotFound />;
//   if (!invoice) return <Loading />;

//   return (
//     <>
//       <div className="space-y-6">
//         <Card>
//           <div className="p-4 flex flex-col md:flex-row justify-between items-start gap-4">
//             <div>
//               <h1 className="text-xl font-bold">
//                 جزئیات فاکتور: {invoice.invoiceNumberName}
//               </h1>
//               <div className="flex flex-wrap items-center gap-2 mt-2">
//                 <InvoiceStatusBadge status={invoice.invoiceStatus} />
//                 <PaymentStatusBadge status={invoice.paymentStatus} />
//               </div>
//             </div>
//             <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
//               <Button
//                 variant="primary"
//                 onClick={() => setPaymentModalOpen(true)}
//                 icon={<DIcon icon="fa-dollar-sign" cdi={false} />}
//               >
//                 ثبت پرداخت
//               </Button>
//               <Button
//                 variant="ghost"
//                 onClick={() => setStatusModalOpen(true)}
//                 icon={<DIcon icon="fa-edit" cdi={false} />}
//                 disabled={submitting}
//               >
//                 تغییر وضعیت
//               </Button>
//               {invoice.requestId && (
//                 <Link href={`/dashboard/requests/${invoice.requestId}`}>
//                   <Button
//                     variant="ghost"
//                     icon={<DIcon icon="fa-eye" cdi={false} />}
//                   >
//                     مشاهده درخواست
//                   </Button>
//                 </Link>
//               )}
//               <Link href={`/dashboard/invoices/${invoice.id}/print`}>
//                 <Button
//                   variant="ghost"
//                   icon={<DIcon icon="fa-print" cdi={false} />}
//                 >
//                   پیش‌نمایش چاپ
//                 </Button>
//               </Link>
//             </div>
//           </div>
//         </Card>

//         <Card>
//           <div className="p-4">
//             <h2 className="font-semibold text-lg mb-4">اطلاعات کلی</h2>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
//               <div>
//                 <p className="text-gray-500 dark:text-gray-400">مشتری:</p>
//                 <p className="font-medium">
//                   {invoice.workspaceUser?.displayName ||
//                     invoice.workspaceUser?.user.name ||
//                     invoice.workspaceUser?.user.phone}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-gray-500 dark:text-gray-400">شماره تماس:</p>
//                 <p className="font-medium">
//                   {invoice.workspaceUser?.user.phone || "-"}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-gray-500 dark:text-gray-400">تاریخ صدور:</p>
//                 <p className="font-medium">
//                   <DateDisplay date={invoice.issueDate} />
//                 </p>
//               </div>
//               <div>
//                 <p className="text-gray-500 dark:text-gray-400">
//                   تاریخ سررسید:
//                 </p>
//                 <p className="font-medium">
//                   <DateDisplay date={invoice.dueDate} />
//                 </p>
//               </div>
//             </div>
//           </div>
//         </Card>

//         <Card className="overflow-hidden">
//           <InvoiceItemsView items={invoice.items} />
//         </Card>

//         <Card>
//           <div className="p-4">
//             <h2 className="font-semibold text-lg mb-4">خلاصه مالی</h2>
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-gray-600 dark:text-gray-300">
//                   جمع جزء:
//                 </span>
//                 <span>{invoice.subtotal.toLocaleString()} تومان</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600 dark:text-gray-300">تخفیف:</span>
//                 <span className="text-red-600">
//                   - {invoice.discount.toLocaleString()} تومان
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600 dark:text-gray-300">
//                   مالیات:
//                 </span>
//                 <span>+ {invoice.tax.toLocaleString()} تومان</span>
//               </div>
//               <hr className="my-2 dark:border-gray-600" />
//               <div className="flex justify-between font-bold text-base">
//                 <span>مبلغ کل:</span>
//                 <span>{invoice.total.toLocaleString()} تومان</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600 dark:text-gray-300">
//                   پرداخت شده:
//                 </span>
//                 <span className="font-semibold text-green-600">
//                   {totalPaid.toLocaleString()} تومان
//                 </span>
//               </div>

//               {balanceDue > 0 && (
//                 <div className="flex justify-between font-bold text-base bg-red-50 dark:bg-red-900/50 p-2 rounded text-red-700 dark:text-red-300">
//                   <span>مانده جهت پرداخت:</span>
//                   <span>{balanceDue.toLocaleString()} تومان</span>
//                 </div>
//               )}
//               {balanceDue < 0 && (
//                 <div className="flex justify-between font-bold text-base bg-blue-50 dark:bg-blue-900/50 p-2 rounded text-blue-700 dark:text-blue-300">
//                   <span>پرداخت مازاد:</span>
//                   <span>{Math.abs(balanceDue).toLocaleString()} تومان</span>
//                 </div>
//               )}
//               {balanceDue === 0 && (
//                 <div className="flex justify-between font-bold text-base bg-green-50 dark:bg-green-900/50 p-2 rounded text-green-700 dark:text-green-300">
//                   <span>وضعیت:</span>
//                   <span>تسویه شده</span>
//                 </div>
//               )}
//             </div>
//           </div>
//         </Card>

//         <Card>
//           <div className="p-4">
//             <h2 className="font-semibold text-lg mb-4">لیست پرداخت‌ها</h2>
//             {invoice.payments && invoice.payments.length > 0 ? (
//               <ul className="space-y-2 text-sm">
//                 {invoice.payments.map((p) => {
//                   const details = paymentTypeDetails[p.type];
//                   return (
//                     <li
//                       key={p.id}
//                       className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"
//                     >
//                       <div className="flex items-center gap-3">
//                         <i
//                           className={`fa-light ${details.icon} text-lg ${details.color}`}
//                         ></i>
//                         <div>
//                           <p className="font-medium">
//                             {p.amount.toLocaleString()} تومان
//                           </p>
//                           <p className="text-xs text-gray-500 dark:text-gray-400">
//                             {details.label} - {paymentMethodMap[p.method]}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="text-xs text-gray-500 dark:text-gray-400">
//                         <DateDisplay date={p.createdAt} />
//                       </div>
//                     </li>
//                   );
//                 })}
//               </ul>
//             ) : (
//               <p className="text-sm text-gray-500 dark:text-gray-400">
//                 هیچ پرداختی ثبت نشده است.
//               </p>
//             )}
//           </div>
//         </Card>

//         <Card>
//           <div className="p-6 md:p-8">
//             <div className="flex flex-col md:flex-row justify-between items-start border-b pb-4 mb-4 gap-4">
//               <div>
//                 <h2 className="text-2xl font-bold">فاکتور فروش</h2>
//                 <p className="text-gray-500">{invoice.invoiceNumberName}</p>
//               </div>
//               <div className="text-left md:text-right w-full md:w-auto text-sm">
//                 <p>
//                   <strong>تاریخ صدور:</strong>{" "}
//                   <DateDisplay date={invoice.issueDate} />
//                 </p>
//                 <p>
//                   <strong>تاریخ سررسید:</strong>{" "}
//                   <DateDisplay date={invoice.dueDate} />
//                 </p>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 text-sm">
//               <div>
//                 <h3 className="font-semibold mb-2">فروشنده:</h3>
//                 <p>نام شرکت شما</p>
//                 <p>آدرس شما</p>
//                 <p>تلفن شما</p>
//               </div>
//               <div className="text-left md:text-right">
//                 <h3 className="font-semibold mb-2">خریدار:</h3>
//                 <p>
//                   {invoice.workspaceUser?.displayName ||
//                     invoice.workspaceUser?.user.name}
//                 </p>
//                 <p>{invoice.workspaceUser?.user.address || "-"}</p>
//                 <p>{invoice.workspaceUser?.user.phone || "-"}</p>
//               </div>
//             </div>
//             <div className="overflow-x-auto rounded-md border">
//               <table className="w-full text-sm">
//                 <thead className="bg-gray-50 dark:bg-gray-800">
//                   <tr>
//                     <th className="p-2 text-right">#</th>
//                     <th className="p-2 text-right">کالا/خدمت</th>
//                     <th className="p-2 text-center">تعداد</th>
//                     <th className="p-2 text-center">قیمت واحد</th>
//                     <th className="p-2 text-left">مبلغ کل</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {invoice.items.map((item, i) => (
//                     <tr key={item.id} className="border-b dark:border-gray-700">
//                       <td className="p-2">{i + 1}</td>
//                       <td className="p-2 font-medium">{item.itemName}</td>
//                       <td className="p-2 text-center">{item.quantity}</td>
//                       <td className="p-2 text-center">
//                         {item.unitPrice.toLocaleString()}
//                       </td>
//                       <td className="p-2 text-left font-semibold">
//                         {item.total.toLocaleString()}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//                 <tfoot className="font-bold bg-gray-50 dark:bg-gray-800">
//                   <tr>
//                     <td
//                       colSpan={4}
//                       className="p-2 text-left border-t dark:border-gray-700"
//                     >
//                       جمع جزء:
//                     </td>
//                     <td className="p-2 text-left border-t dark:border-gray-700">
//                       {invoice.subtotal.toLocaleString()}
//                     </td>
//                   </tr>
//                   <tr>
//                     <td colSpan={4} className="p-2 text-left">
//                       تخفیف:
//                     </td>
//                     <td className="p-2 text-left">
//                       {invoice.discount.toLocaleString()}
//                     </td>
//                   </tr>
//                   <tr>
//                     <td colSpan={4} className="p-2 text-left">
//                       مالیات:
//                     </td>
//                     <td className="p-2 text-left">
//                       {invoice.tax.toLocaleString()}
//                     </td>
//                   </tr>
//                   <tr className="bg-gray-100 dark:bg-gray-900 text-lg">
//                     <td colSpan={4} className="p-3 text-left">
//                       مبلغ نهایی:
//                     </td>
//                     <td className="p-3 text-left">
//                       {invoice.total.toLocaleString()} تومان
//                     </td>
//                   </tr>
//                 </tfoot>
//               </table>
//             </div>
//             <div className="border-t mt-8 pt-4 text-xs text-gray-500 text-center">
//               <p>مهر و امضا</p>
//             </div>
//           </div>
//         </Card>
//       </div>

//       <Modal
//         isOpen={isStatusModalOpen}
//         onClose={() => setStatusModalOpen(false)}
//         title="تغییر وضعیت فاکتور"
//       >
//         <div className="p-4 space-y-3">
//           <p>وضعیت جدید را انتخاب کنید:</p>
//           <div className="flex flex-col gap-2">
//             <Button
//               variant="primary"
//               outline
//               onClick={() => handleStatusChange("APPROVED")}
//               disabled={submitting || invoice.invoiceStatus === "APPROVED"}
//             >
//               تایید شده
//             </Button>
//             <Button
//               variant="warning"
//               outline
//               onClick={() => handleStatusChange("PENDING")}
//               disabled={submitting || invoice.invoiceStatus === "PENDING"}
//             >
//               در انتظار تایید
//             </Button>
//             <Button
//               variant="error"
//               outline
//               onClick={() => handleStatusChange("CANCELED")}
//               disabled={submitting || invoice.invoiceStatus === "CANCELED"}
//             >
//               لغو شده
//             </Button>
//             <Button variant="ghost" onClick={() => setStatusModalOpen(false)}>
//               انصراف
//             </Button>
//           </div>
//         </div>
//       </Modal>

//       <Modal
//         isOpen={isPaymentModalOpen}
//         onClose={() => setPaymentModalOpen(false)}
//         title="ثبت پرداخت جدید"
//         size="2xl"
//       >
//         <CreatePaymentPage
//           defaultValues={{
//             invoice: invoice,
//             workspaceUser: invoice.workspaceUser,
//             amount: balanceDue > 0 ? balanceDue : 0,
//           }}
//           back={false}
//           after={() => {
//             setPaymentModalOpen(false);
//             fetchInvoiceDetails();
//           }}
//         />
//       </Modal>
//     </>
//   );
// }

// // "use client";

// // import DIcon from "@/@Client/Components/common/DIcon";
// // import Loading from "@/@Client/Components/common/Loading";
// // import NotFound from "@/@Client/Components/common/NotFound";
// // import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
// // import Button from "@/@Client/Components/ui/Button2";
// // import InvoiceStatusBadge from "@/modules/invoices/components/InvoiceStatusBadge";
// // import PaymentStatusBadge from "@/modules/invoices/components/PaymentStatusBadge";
// // import { useInvoice } from "@/modules/invoices/hooks/useInvoice";
// // import { InvoiceWithRelations } from "@/modules/invoices/types";
// // import CreatePaymentPage from "@/modules/payments/views/create/page";
// // import { InvoiceStatus, PaymentMethod, PaymentType } from "@prisma/client";
// // import { Card, Modal } from "ndui-ahrom";
// // import Link from "next/link";
// // import { useEffect, useState } from "react";
// // import { toast } from "react-toastify";
// // import InvoiceItemsView from "../../components/InvoiceItemsView";

// // // آبجکت‌های کمکی برای ترجمه و نمایش آیکون‌ها
// // const paymentTypeDetails: Record<
// //   PaymentType,
// //   { label: string; icon: string; color: string }
// // > = {
// //   RECEIVE: { label: "دریافتی", icon: "fa-arrow-down", color: "text-green-500" },
// //   PAY: { label: "پرداختی", icon: "fa-arrow-up", color: "text-red-500" },
// // };
// // const paymentMethodMap: Record<PaymentMethod, string> = {
// //   CASH: "نقد",
// //   CARD: "کارتخوان",
// //   TRANSFER: "انتقال",
// // };

// // interface InvoiceDetailsViewProps {
// //   id: number;
// //   isAdmin: boolean;
// //   backUrl: string;
// // }

// // export default function DetailPage({ id, isAdmin }: InvoiceDetailsViewProps) {
// //   const { getById, loading, statusCode, update, submitting } = useInvoice();
// //   const [invoice, setInvoice] = useState<InvoiceWithRelations | null>(null);
// //   const [isStatusModalOpen, setStatusModalOpen] = useState(false);
// //   const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

// //   useEffect(() => {
// //     if (id) {
// //       fetchInvoiceDetails();
// //     }
// //   }, [id]);

// //   const fetchInvoiceDetails = async () => {
// //     try {
// //       const data = await getById(id);
// //       if (data) setInvoice(data);
// //     } catch (error) {
// //       console.error("Error fetching invoice details:", error);
// //     }
// //   };

// //   const handleStatusChange = async (newStatus: InvoiceStatus) => {
// //     if (!invoice) return;
// //     try {
// //       await update(invoice.id, { invoiceStatus: newStatus });
// //       toast.success("وضعیت فاکتور با موفقیت تغییر کرد.");
// //       fetchInvoiceDetails();
// //     } catch (error) {
// //       toast.error("خطا در تغییر وضعیت فاکتور.");
// //     } finally {
// //       setStatusModalOpen(false);
// //     }
// //   };

// //   const receives =
// //     invoice?.payments
// //       ?.filter((p) => p.type === "RECEIVE")
// //       .reduce((sum, p) => sum + p.amount, 0) || 0;
// //   const pays =
// //     invoice?.payments
// //       ?.filter((p) => p.type === "PAY")
// //       .reduce((sum, p) => sum + p.amount, 0) || 0;
// //   let totalPaid = 0;
// //   if (invoice?.type === "SALES" || invoice?.type === "RETURN_PURCHASE") {
// //     totalPaid = receives - pays;
// //   } else if (invoice?.type === "PURCHASE" || invoice?.type === "RETURN_SALES") {
// //     totalPaid = pays - receives;
// //   }
// //   const balanceDue = (invoice?.total || 0) - totalPaid;

// //   if (loading && !invoice) return <Loading />;
// //   if (statusCode === 404) return <NotFound />;
// //   if (!invoice) return <Loading />;

// //   return (
// //     <>
// //       <div className="space-y-6">
// //         <Card>
// //           <div className="p-4 flex flex-col md:flex-row justify-between items-start gap-4">
// //             <div>
// //               <h1 className="text-xl font-bold">
// //                 جزئیات فاکتور: {invoice.invoiceNumberName}
// //               </h1>
// //               <div className="flex flex-wrap items-center gap-2 mt-2">
// //                 <InvoiceStatusBadge status={invoice.invoiceStatus} />
// //                 <PaymentStatusBadge status={invoice.paymentStatus} />
// //               </div>
// //             </div>
// //             <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
// //               <Button
// //                 variant="primary"
// //                 onClick={() => setPaymentModalOpen(true)}
// //                 icon={<DIcon icon="fa-dollar-sign" cdi={false} />}
// //               >
// //                 ثبت پرداخت
// //               </Button>
// //               <Button
// //                 variant="ghost"
// //                 onClick={() => setStatusModalOpen(true)}
// //                 icon={<DIcon icon="fa-edit" cdi={false} />}
// //                 disabled={submitting}
// //               >
// //                 تغییر وضعیت
// //               </Button>
// //               {invoice.requestId && (
// //                 <Link href={`/dashboard/requests/${invoice.requestId}`}>
// //                   <Button
// //                     variant="ghost"
// //                     icon={<DIcon icon="fa-eye" cdi={false} />}
// //                   >
// //                     مشاهده درخواست
// //                   </Button>
// //                 </Link>
// //               )}
// //               <Link href={`/dashboard/invoices/${invoice.id}/print`}>
// //                 <Button
// //                   variant="ghost"
// //                   icon={<DIcon icon="fa-print" cdi={false} />}
// //                 >
// //                   پیش‌نمایش چاپ
// //                 </Button>
// //               </Link>
// //             </div>
// //           </div>
// //         </Card>

// //         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
// //           <div className="lg:col-span-2 space-y-6">
// //             <Card>
// //               <div className="p-4">
// //                 <h2 className="font-semibold text-lg mb-4">اطلاعات کلی</h2>
// //                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
// //                   <div>
// //                     <p className="text-gray-500 dark:text-gray-400">مشتری:</p>
// //                     <p className="font-medium">
// //                       {invoice.workspaceUser?.displayName ||
// //                         invoice.workspaceUser?.user.name ||
// //                         invoice.workspaceUser?.user.phone}
// //                     </p>
// //                   </div>
// //                   <div>
// //                     <p className="text-gray-500 dark:text-gray-400">
// //                       شماره تماس:
// //                     </p>
// //                     <p className="font-medium">
// //                       {invoice.workspaceUser?.user.phone || ""}
// //                     </p>
// //                   </div>
// //                   <div>
// //                     <p className="text-gray-500 dark:text-gray-400">
// //                       تاریخ صدور:
// //                     </p>
// //                     <p className="font-medium">
// //                       <DateDisplay date={invoice.issueDate || ""} />
// //                     </p>
// //                   </div>
// //                   <div>
// //                     <p className="text-gray-500 dark:text-gray-400">
// //                       تاریخ سررسید:
// //                     </p>
// //                     <p className="font-medium">
// //                       <DateDisplay date={invoice.dueDate || ""} />
// //                     </p>
// //                   </div>
// //                 </div>
// //               </div>
// //             </Card>

// //             <Card className="overflow-hidden">
// //               <InvoiceItemsView items={invoice.items} />
// //             </Card>
// //           </div>

// //           <div className="lg:col-span-1 space-y-6">
// //             <Card>
// //               <div className="p-4">
// //                 <h2 className="font-semibold text-lg mb-4">خلاصه مالی</h2>
// //                 <div className="space-y-2 text-sm">
// //                   <div className="flex justify-between">
// //                     <span className="text-gray-600 dark:text-gray-300">
// //                       جمع جزء:
// //                     </span>
// //                     <span>{invoice.subtotal.toLocaleString()} تومان</span>
// //                   </div>
// //                   <div className="flex justify-between">
// //                     <span className="text-gray-600 dark:text-gray-300">
// //                       تخفیف:
// //                     </span>
// //                     <span className="text-red-600">
// //                       - {invoice.discount.toLocaleString()} تومان
// //                     </span>
// //                   </div>
// //                   <div className="flex justify-between">
// //                     <span className="text-gray-600 dark:text-gray-300">
// //                       مالیات:
// //                     </span>
// //                     <span>+ {invoice.tax.toLocaleString()} تومان</span>
// //                   </div>
// //                   <hr className="my-2 dark:border-gray-600" />
// //                   <div className="flex justify-between font-bold text-base">
// //                     <span>مبلغ کل:</span>
// //                     <span>{invoice.total.toLocaleString()} تومان</span>
// //                   </div>
// //                   <div className="flex justify-between">
// //                     <span className="text-gray-600 dark:text-gray-300">
// //                       پرداخت شده:
// //                     </span>
// //                     <span className="font-semibold text-green-600">
// //                       {totalPaid.toLocaleString()} تومان
// //                     </span>
// //                   </div>
// //                   <div className="flex justify-between font-bold text-base bg-gray-100 dark:bg-gray-700 p-2 rounded">
// //                     <span>مانده حساب:</span>
// //                     <span>{balanceDue.toLocaleString()} تومان</span>
// //                   </div>
// //                 </div>
// //               </div>
// //             </Card>

// //             <Card>
// //               <div className="p-4">
// //                 <h2 className="font-semibold text-lg mb-4">لیست پرداخت‌ها</h2>
// //                 {invoice.payments && invoice.payments.length > 0 ? (
// //                   <ul className="space-y-2 text-sm">
// //                     {invoice.payments.map((p) => {
// //                       const details = paymentTypeDetails[p.type];
// //                       return (
// //                         <li
// //                           key={p.id}
// //                           className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"
// //                         >
// //                           <div className="flex items-center gap-3">
// //                             <DIcon
// //                               icon={details?.icon}
// //                               cdi={false}
// //                               classCustom={`text-lg ${details?.color}`}
// //                             />
// //                             <div>
// //                               <p className="font-medium">
// //                                 {p.amount.toLocaleString()} تومان
// //                               </p>
// //                               <p className="text-xs text-gray-500 dark:text-gray-400">
// //                                 {details?.label} - {paymentMethodMap[p.method]}
// //                               </p>
// //                             </div>
// //                           </div>
// //                           <div className="text-xs text-gray-500 dark:text-gray-400">
// //                             <DateDisplay date={p.createdAt} />
// //                           </div>
// //                         </li>
// //                       );
// //                     })}
// //                   </ul>
// //                 ) : (
// //                   <p className="text-sm text-gray-500 dark:text-gray-400">
// //                     هیچ پرداختی ثبت نشده است.
// //                   </p>
// //                 )}
// //               </div>
// //             </Card>
// //           </div>
// //         </div>

// //         <Card>
// //           <div className="p-6 md:p-8">
// //             <div className="flex justify-between items-center border-b pb-4 mb-4">
// //               <div>
// //                 <h2 className="text-2xl font-bold">فاکتور فروش</h2>
// //                 <p className="text-gray-500">{invoice.invoiceNumberName}</p>
// //               </div>
// //               <div className="text-right">
// //                 <p>
// //                   تاریخ صدور: <DateDisplay date={invoice.issueDate || ""} />
// //                 </p>
// //                 <p>
// //                   تاریخ سررسید: <DateDisplay date={invoice.dueDate || ""} />
// //                 </p>
// //               </div>
// //             </div>
// //             <div className="grid grid-cols-2 gap-4 mb-8">
// //               <div>
// //                 <h3 className="font-semibold">فروشنده:</h3>
// //                 <p>نام شرکت شما</p>
// //                 <p>آدرس شما</p>
// //                 <p>تلفن شما</p>
// //               </div>
// //               <div className="text-right">
// //                 <h3 className="font-semibold">خریدار:</h3>
// //                 <p>
// //                   {invoice.workspaceUser?.displayName ||
// //                     invoice.workspaceUser?.user.name ||
// //                     "-"}
// //                 </p>
// //                 <p>{invoice.workspaceUser?.user?.address || "-"}</p>
// //                 <p>{invoice.workspaceUser?.user?.phone || "-"}</p>
// //               </div>
// //             </div>
// //             <div className="overflow-x-auto rounded-md border">
// //               <table className="w-full text-sm">
// //                 <thead className="bg-gray-50">
// //                   <tr>
// //                     <th className="p-2 text-right">#</th>
// //                     <th className="p-2 text-right">کالا/خدمت</th>
// //                     <th className="p-2 text-center">تعداد</th>
// //                     <th className="p-2 text-center">قیمت واحد</th>
// //                     <th className="p-2 text-left">مبلغ کل</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {invoice.items.map((item, i) => (
// //                     <tr key={item.id} className="border-b">
// //                       <td className="p-2">{i + 1}</td>
// //                       <td className="p-2">{item.itemName}</td>
// //                       <td className="p-2 text-center">{item.quantity}</td>
// //                       <td className="p-2 text-center">
// //                         {item.unitPrice.toLocaleString()}
// //                       </td>
// //                       <td className="p-2 text-left">
// //                         {item.total.toLocaleString()}
// //                       </td>
// //                     </tr>
// //                   ))}
// //                 </tbody>
// //                 <tfoot className="font-bold">
// //                   <tr>
// //                     <td colSpan={4} className="p-2 text-left">
// //                       جمع جزء:
// //                     </td>
// //                     <td className="p-2 text-left">
// //                       {invoice.subtotal.toLocaleString()}
// //                     </td>
// //                   </tr>
// //                   <tr>
// //                     <td colSpan={4} className="p-2 text-left">
// //                       تخفیف:
// //                     </td>
// //                     <td className="p-2 text-left">
// //                       {invoice.discount.toLocaleString()}
// //                     </td>
// //                   </tr>
// //                   <tr>
// //                     <td colSpan={4} className="p-2 text-left">
// //                       مالیات:
// //                     </td>
// //                     <td className="p-2 text-left">
// //                       {invoice.tax.toLocaleString()}
// //                     </td>
// //                   </tr>
// //                   <tr className="bg-gray-100 text-lg">
// //                     <td colSpan={4} className="p-3 text-left">
// //                       مبلغ نهایی:
// //                     </td>
// //                     <td className="p-3 text-left">
// //                       {invoice.total.toLocaleString()} تومان
// //                     </td>
// //                   </tr>
// //                 </tfoot>
// //               </table>
// //             </div>
// //             <div className="border-t mt-8 pt-4 text-xs text-gray-500 text-center">
// //               <p>مهر و امضا</p>
// //             </div>
// //           </div>
// //         </Card>
// //       </div>

// //       <Modal
// //         isOpen={isStatusModalOpen}
// //         onClose={() => setStatusModalOpen(false)}
// //         title="تغییر وضعیت فاکتور"
// //       >
// //         <div className="p-4 space-y-3">
// //           <p>وضعیت جدید را انتخاب کنید:</p>
// //           <div className="flex flex-col gap-2">
// //             <Button
// //               variant="primary"
// //               outline
// //               onClick={() => handleStatusChange("APPROVED")}
// //               disabled={submitting || invoice.invoiceStatus === "APPROVED"}
// //             >
// //               تایید شده
// //             </Button>
// //             <Button
// //               variant="warning"
// //               outline
// //               onClick={() => handleStatusChange("PENDING")}
// //               disabled={submitting || invoice.invoiceStatus === "PENDING"}
// //             >
// //               در انتظار تایید
// //             </Button>
// //             <Button
// //               variant="error"
// //               outline
// //               onClick={() => handleStatusChange("CANCELED")}
// //               disabled={submitting || invoice.invoiceStatus === "CANCELED"}
// //             >
// //               لغو شده
// //             </Button>
// //             <Button variant="ghost" onClick={() => setStatusModalOpen(false)}>
// //               انصراف
// //             </Button>
// //           </div>
// //         </div>
// //       </Modal>

// //       <Modal
// //         isOpen={isPaymentModalOpen}
// //         onClose={() => setPaymentModalOpen(false)}
// //         title="ثبت پرداخت جدید"
// //       >
// //         <CreatePaymentPage
// //           defaultValues={{
// //             invoice: invoice,
// //             workspaceUser: invoice.workspaceUser,
// //             amount: balanceDue > 0 ? balanceDue : 0,
// //           }}
// //           back={false}
// //           after={() => {
// //             setPaymentModalOpen(false);
// //             fetchInvoiceDetails();
// //           }}
// //         />
// //       </Modal>
// //     </>
// //   );
// // }

// // // "use client";

// // // import DIcon from "@/@Client/Components/common/DIcon";
// // // import Loading from "@/@Client/Components/common/Loading";
// // // import NotFound from "@/@Client/Components/common/NotFound";
// // // import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
// // // import Button from "@/@Client/Components/ui/Button2";
// // // import InvoiceStatusBadge from "@/modules/invoices/components/InvoiceStatusBadge";
// // // import PaymentStatusBadge from "@/modules/invoices/components/PaymentStatusBadge";
// // // import { useInvoice } from "@/modules/invoices/hooks/useInvoice";
// // // import { InvoiceWithRelations } from "@/modules/invoices/types";
// // // import CreatePaymentPage from "@/modules/payments/views/create/page";
// // // import { InvoiceStatus } from "@prisma/client";
// // // import { Card, Modal } from "ndui-ahrom";
// // // import Link from "next/link";
// // // import { useEffect, useState } from "react";
// // // import { toast } from "react-toastify";

// // // interface InvoiceDetailsViewProps {
// // //   id: number;
// // //   isAdmin: boolean;
// // //   backUrl: string;
// // // }

// // // export default function DetailPage({ id, isAdmin }: InvoiceDetailsViewProps) {
// // //   const { getById, loading, statusCode, update, submitting } = useInvoice();
// // //   const [invoice, setInvoice] = useState<InvoiceWithRelations | null>(null);
// // //   const [isStatusModalOpen, setStatusModalOpen] = useState(false);
// // //   const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

// // //   useEffect(() => {
// // //     if (id) {
// // //       fetchInvoiceDetails();
// // //     }
// // //   }, [id]);

// // //   const fetchInvoiceDetails = async () => {
// // //     try {
// // //       const data = await getById(id);
// // //       if (data) setInvoice(data);
// // //     } catch (error) {
// // //       console.error("Error fetching invoice details:", error);
// // //     }
// // //   };

// // //   const handleStatusChange = async (newStatus: InvoiceStatus) => {
// // //     if (!invoice) return;
// // //     try {
// // //       await update(invoice.id, { invoiceStatus: newStatus });
// // //       toast.success("وضعیت فاکتور با موفقیت تغییر کرد.");
// // //       fetchInvoiceDetails();
// // //     } catch (error) {
// // //       toast.error("خطا در تغییر وضعیت فاکتور.");
// // //     } finally {
// // //       setStatusModalOpen(false);
// // //     }
// // //   };

// // //   const totalPaid =
// // //     invoice?.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
// // //   const balanceDue = (invoice?.total || 0) - totalPaid;

// // //   if (loading && !invoice) return <Loading />;
// // //   if (statusCode === 404) return <NotFound />;
// // //   if (!invoice) return <Loading />;

// // //   return (
// // //     <>
// // //       <div className="space-y-6">
// // //         <Card>
// // //           <div className="p-4 flex flex-col md:flex-row justify-between items-start gap-4">
// // //             <div>
// // //               <h1 className="text-xl font-bold">
// // //                 جزئیات فاکتور: {invoice.invoiceNumberName}
// // //               </h1>
// // //               <div className="flex flex-wrap items-center gap-2 mt-2">
// // //                 <InvoiceStatusBadge status={invoice.invoiceStatus} />
// // //                 <PaymentStatusBadge status={invoice.paymentStatus} />
// // //               </div>
// // //             </div>
// // //             {/* دکمه‌ها در یک گروه برای مدیریت بهتر در موبایل و دسکتاپ */}
// // //             <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
// // //               <Button
// // //                 variant="primary"
// // //                 onClick={() => setPaymentModalOpen(true)}
// // //                 icon={<DIcon icon="fa-dollar-sign" cdi={false} />}
// // //               >
// // //                 ثبت پرداخت
// // //               </Button>
// // //               <details className="dropdown">
// // //                 <summary className="btn btn-ghost">
// // //                   <DIcon icon="fa-ellipsis-v" cdi={false} />
// // //                   عملیات
// // //                 </summary>
// // //                 <ul className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
// // //                   <li>
// // //                     <a onClick={() => setStatusModalOpen(true)}>
// // //                       <DIcon icon="fa-edit" cdi={false} /> تغییر وضعیت
// // //                     </a>
// // //                   </li>
// // //                   {invoice.requestId && (
// // //                     <li>
// // //                       <Link href={`/dashboard/requests/${invoice.requestId}`}>
// // //                         <DIcon icon="fa-eye" cdi={false} /> مشاهده درخواست
// // //                       </Link>
// // //                     </li>
// // //                   )}
// // //                   <li>
// // //                     <Link href={`/dashboard/invoices/${invoice.id}/print`}>
// // //                       <DIcon icon="fa-print" cdi={false} /> پیش‌نمایش چاپ
// // //                     </Link>
// // //                   </li>
// // //                 </ul>
// // //               </details>
// // //             </div>
// // //           </div>
// // //         </Card>

// // //         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
// // //           <div className="lg:col-span-2 space-y-6">
// // //             <Card>
// // //               <div className="p-4">
// // //                 <h2 className="font-semibold text-lg mb-4">اطلاعات کلی</h2>
// // //                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
// // //                   <div>
// // //                     <p className="text-gray-500 dark:text-gray-400">مشتری:</p>
// // //                     <p className="font-medium">
// // //                       {invoice.workspaceUser?.user.name ||
// // //                         invoice.workspaceUser?.user.phone}
// // //                     </p>
// // //                   </div>
// // //                   <div>
// // //                     <p className="text-gray-500 dark:text-gray-400">
// // //                       شماره تماس:
// // //                     </p>
// // //                     <p className="font-medium">
// // //                       {invoice.workspaceUser?.user.phone}
// // //                     </p>
// // //                   </div>
// // //                   <div>
// // //                     <p className="text-gray-500 dark:text-gray-400">
// // //                       تاریخ صدور:
// // //                     </p>
// // //                     <p className="font-medium">
// // //                       <DateDisplay date={invoice.issueDate || ""} />
// // //                     </p>
// // //                   </div>
// // //                   <div>
// // //                     <p className="text-gray-500 dark:text-gray-400">
// // //                       تاریخ سررسید:
// // //                     </p>
// // //                     <p className="font-medium">
// // //                       <DateDisplay date={invoice.dueDate || ""} />
// // //                     </p>
// // //                   </div>
// // //                 </div>
// // //               </div>
// // //             </Card>

// // //             <Card>
// // //               <div className="p-4">
// // //                 <h2 className="font-semibold text-lg mb-4">اقلام فاکتور</h2>
// // //                 <div className="overflow-x-auto">
// // //                   <table className="w-full text-sm">
// // //                     <thead className="bg-gray-50 dark:bg-gray-700">
// // //                       <tr>
// // //                         <th className="text-right p-2 font-medium">شرح</th>
// // //                         <th className="text-center p-2 font-medium">تعداد</th>
// // //                         <th className="text-center p-2 font-medium">
// // //                           قیمت واحد
// // //                         </th>
// // //                         <th className="text-left p-2 font-medium">جمع کل</th>
// // //                       </tr>
// // //                     </thead>
// // //                     <tbody>
// // //                       {invoice.items.map((item) => (
// // //                         <tr
// // //                           key={item.id}
// // //                           className="border-b dark:border-gray-600"
// // //                         >
// // //                           <td className="p-2">{item.description}</td>
// // //                           <td className="text-center p-2">{item.quantity}</td>
// // //                           <td className="text-center p-2">
// // //                             {item.unitPrice.toLocaleString()}
// // //                           </td>
// // //                           <td className="text-left p-2">
// // //                             {item.total.toLocaleString()} تومان
// // //                           </td>
// // //                         </tr>
// // //                       ))}
// // //                     </tbody>
// // //                   </table>
// // //                 </div>
// // //               </div>
// // //             </Card>
// // //           </div>

// // //           <div className="lg:col-span-1 space-y-6">
// // //             <Card>
// // //               <div className="p-4">
// // //                 <h2 className="font-semibold text-lg mb-4">خلاصه مالی</h2>
// // //                 <div className="space-y-2 text-sm">
// // //                   <div className="flex justify-between">
// // //                     <span className="text-gray-600 dark:text-gray-300">
// // //                       جمع جزء:
// // //                     </span>
// // //                     <span>{invoice.subtotal.toLocaleString()} تومان</span>
// // //                   </div>
// // //                   <div className="flex justify-between">
// // //                     <span className="text-gray-600 dark:text-gray-300">
// // //                       تخفیف:
// // //                     </span>
// // //                     <span className="text-red-600">
// // //                       - {invoice.discount.toLocaleString()} تومان
// // //                     </span>
// // //                   </div>
// // //                   <div className="flex justify-between">
// // //                     <span className="text-gray-600 dark:text-gray-300">
// // //                       مالیات:
// // //                     </span>
// // //                     <span>+ {invoice.tax.toLocaleString()} تومان</span>
// // //                   </div>
// // //                   <hr className="my-2 dark:border-gray-600" />
// // //                   <div className="flex justify-between font-bold text-base">
// // //                     <span>مبلغ کل:</span>
// // //                     <span>{invoice.total.toLocaleString()} تومان</span>
// // //                   </div>
// // //                   <div className="flex justify-between">
// // //                     <span className="text-gray-600 dark:text-gray-300">
// // //                       پرداخت شده:
// // //                     </span>
// // //                     <span className="font-semibold text-green-600">
// // //                       {totalPaid.toLocaleString()} تومان
// // //                     </span>
// // //                   </div>
// // //                   <div className="flex justify-between font-bold text-base bg-gray-100 dark:bg-gray-700 p-2 rounded">
// // //                     <span>مانده حساب:</span>
// // //                     <span>{balanceDue.toLocaleString()} تومان</span>
// // //                   </div>
// // //                 </div>
// // //               </div>
// // //             </Card>

// // //             <Card>
// // //               <div className="p-4">
// // //                 <h2 className="font-semibold text-lg mb-4">لیست پرداخت‌ها</h2>
// // //                 {invoice.payments && invoice.payments.length > 0 ? (
// // //                   <ul className="space-y-2 text-sm">
// // //                     {invoice.payments.map((p) => (
// // //                       <li
// // //                         key={p.id}
// // //                         className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"
// // //                       >
// // //                         <div>
// // //                           <p className="font-medium">
// // //                             {p.amount.toLocaleString()} تومان
// // //                           </p>
// // //                           <p className="text-xs text-gray-500 dark:text-gray-400">
// // //                             <DateDisplay date={p.createdAt} />
// // //                           </p>
// // //                         </div>
// // //                         <span className="text-gray-600 dark:text-gray-300">
// // //                           {p.method}
// // //                         </span>
// // //                       </li>
// // //                     ))}
// // //                   </ul>
// // //                 ) : (
// // //                   <p className="text-sm text-gray-500 dark:text-gray-400">
// // //                     هیچ پرداختی ثبت نشده است.
// // //                   </p>
// // //                 )}
// // //               </div>
// // //             </Card>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       <Modal
// // //         isOpen={isStatusModalOpen}
// // //         onClose={() => setStatusModalOpen(false)}
// // //         title="تغییر وضعیت فاکتور"
// // //       >
// // //         <div className="p-4 space-y-3">
// // //           <p>وضعیت جدید را انتخاب کنید:</p>
// // //           <div className="flex flex-col gap-2">
// // //             <Button
// // //               variant="primary"
// // //               outline
// // //               onClick={() => handleStatusChange("APPROVED")}
// // //               disabled={submitting || invoice.invoiceStatus === "APPROVED"}
// // //             >
// // //               تایید شده
// // //             </Button>
// // //             <Button
// // //               variant="warning"
// // //               outline
// // //               onClick={() => handleStatusChange("PENDING")}
// // //               disabled={submitting || invoice.invoiceStatus === "PENDING"}
// // //             >
// // //               در انتظار تایید
// // //             </Button>
// // //             <Button
// // //               variant="error"
// // //               outline
// // //               onClick={() => handleStatusChange("CANCELED")}
// // //               disabled={submitting || invoice.invoiceStatus === "CANCELED"}
// // //             >
// // //               لغو شده
// // //             </Button>
// // //             <Button variant="ghost" onClick={() => setStatusModalOpen(false)}>
// // //               انصراف
// // //             </Button>
// // //           </div>
// // //         </div>
// // //       </Modal>

// // //       <Modal
// // //         isOpen={isPaymentModalOpen}
// // //         onClose={() => setPaymentModalOpen(false)}
// // //         title="ثبت پرداخت جدید"
// // //       >
// // //         <CreatePaymentPage
// // //           defaultValues={{
// // //             invoice: invoice,
// // //             workspaceUser: invoice.workspaceUser,
// // //             amount: balanceDue > 0 ? balanceDue : invoice.total,
// // //           }}
// // //           back={false}
// // //           after={() => {
// // //             setPaymentModalOpen(false);
// // //             fetchInvoiceDetails();
// // //           }}
// // //         />
// // //       </Modal>
// // //     </>
// // //   );
// // // }

// // // // "use client";

// // // // import DIcon from "@/@Client/Components/common/DIcon";
// // // // import Loading from "@/@Client/Components/common/Loading";
// // // // import NotFound from "@/@Client/Components/common/NotFound";
// // // // import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
// // // // import Button from "@/@Client/Components/ui/Button2";
// // // // import { useInvoice } from "@/modules/invoices/hooks/useInvoice";
// // // // import { InvoiceWithRelations } from "@/modules/invoices/types";
// // // // import CreatePaymentPage from "@/modules/payments/views/create/page";
// // // // import { InvoiceStatus } from "@prisma/client";
// // // // import { Card, Modal } from "ndui-ahrom";
// // // // import { useEffect, useState } from "react";
// // // // import { toast } from "react-toastify";
// // // // import InvoiceStatusBadge from "../../components/InvoiceStatusBadge";
// // // // import PaymentStatusBadge from "../../components/PaymentStatusBadge";

// // // // interface InvoiceDetailsViewProps {
// // // //   id: number;
// // // //   isAdmin: boolean;
// // // //   backUrl: string;
// // // // }

// // // // export default function DetailPage({ id, isAdmin }: InvoiceDetailsViewProps) {
// // // //   const { getById, loading, statusCode, update, submitting } = useInvoice();
// // // //   const [invoice, setInvoice] = useState<InvoiceWithRelations | null>(null);
// // // //   const [isStatusModalOpen, setStatusModalOpen] = useState(false);
// // // //   const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

// // // //   useEffect(() => {
// // // //     if (id) {
// // // //       fetchInvoiceDetails();
// // // //     }
// // // //   }, [id]);

// // // //   const fetchInvoiceDetails = async () => {
// // // //     try {
// // // //       const data = await getById(id);
// // // //       if (data) setInvoice(data);
// // // //     } catch (error) {
// // // //       console.error("Error fetching invoice details:", error);
// // // //     }
// // // //   };

// // // //   const handleStatusChange = async (newStatus: InvoiceStatus) => {
// // // //     if (!invoice) return;
// // // //     try {
// // // //       await update(invoice.id, { invoiceStatus: newStatus });
// // // //       toast.success("وضعیت فاکتور با موفقیت تغییر کرد.");
// // // //       fetchInvoiceDetails();
// // // //     } catch (error) {
// // // //       toast.error("خطا در تغییر وضعیت فاکتور.");
// // // //       console.error("Failed to update invoice status:", error);
// // // //     } finally {
// // // //       setStatusModalOpen(false);
// // // //     }
// // // //   };

// // // //   const totalPaid =
// // // //     invoice?.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
// // // //   const balanceDue = (invoice?.total || 0) - totalPaid;

// // // //   if (loading && !invoice) return <Loading />;
// // // //   if (statusCode === 404) return <NotFound />;
// // // //   if (!invoice) return <Loading />;

// // // //   return (
// // // //     <>
// // // //       <div className="space-y-6">
// // // //         <Card>
// // // //           <div className="p-4 flex flex-col md:flex-row justify-between items-start gap-4">
// // // //             <div>
// // // //               <h1 className="text-xl font-bold">
// // // //                 جزئیات فاکتور: {invoice.invoiceNumberName}
// // // //               </h1>
// // // //               <div className="flex flex-wrap items-center gap-2 mt-2">
// // // //                 <InvoiceStatusBadge status={invoice.invoiceStatus} />
// // // //                 <PaymentStatusBadge status={invoice.paymentStatus} />
// // // //               </div>
// // // //             </div>
// // // //             <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
// // // //               <Button
// // // //                 variant="primary"
// // // //                 outline
// // // //                 onClick={() => setStatusModalOpen(true)}
// // // //                 icon={<DIcon icon="fa-edit" cdi={false} />}
// // // //                 disabled={submitting}
// // // //               >
// // // //                 تغییر وضعیت
// // // //               </Button>
// // // //               <Button
// // // //                 variant="primary"
// // // //                 onClick={() => setPaymentModalOpen(true)}
// // // //                 icon={<DIcon icon="fa-dollar-sign" cdi={false} />}
// // // //               >
// // // //                 ثبت پرداخت
// // // //               </Button>
// // // //             </div>
// // // //           </div>
// // // //         </Card>

// // // //         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
// // // //           <div className="lg:col-span-2 space-y-6">
// // // //             <Card>
// // // //               <div className="p-4">
// // // //                 <h2 className="font-semibold text-lg mb-4">اطلاعات کلی</h2>
// // // //                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
// // // //                   <div>
// // // //                     <p className="text-gray-500">مشتری:</p>
// // // //                     <p className="font-medium">
// // // //                       {invoice.workspaceUser?.user.name ||
// // // //                         invoice.workspaceUser?.user.phone}
// // // //                     </p>
// // // //                   </div>
// // // //                   <div>
// // // //                     <p className="text-gray-500">شماره تماس:</p>
// // // //                     <p className="font-medium">
// // // //                       {invoice.workspaceUser?.user.phone}
// // // //                     </p>
// // // //                   </div>
// // // //                   <div>
// // // //                     <p className="text-gray-500">تاریخ صدور:</p>
// // // //                     <p className="font-medium">
// // // //                       <DateDisplay date={invoice.issueDate || ""} />
// // // //                     </p>
// // // //                   </div>
// // // //                   <div>
// // // //                     <p className="text-gray-500">تاریخ سررسید:</p>
// // // //                     <p className="font-medium">
// // // //                       <DateDisplay date={invoice.dueDate || ""} />
// // // //                     </p>
// // // //                   </div>
// // // //                 </div>
// // // //               </div>
// // // //             </Card>

// // // //             <Card>
// // // //               <div className="p-4">
// // // //                 <h2 className="font-semibold text-lg mb-4">اقلام فاکتور</h2>
// // // //                 <div className="overflow-x-auto">
// // // //                   <table className="w-full text-sm">
// // // //                     <thead className="bg-gray-50">
// // // //                       <tr>
// // // //                         <th className="text-right p-2 font-medium">شرح</th>
// // // //                         <th className="text-center p-2 font-medium">تعداد</th>
// // // //                         <th className="text-center p-2 font-medium">
// // // //                           قیمت واحد
// // // //                         </th>
// // // //                         <th className="text-left p-2 font-medium">جمع کل</th>
// // // //                       </tr>
// // // //                     </thead>
// // // //                     <tbody>
// // // //                       {invoice.items.map((item) => (
// // // //                         <tr key={item.id} className="border-b">
// // // //                           <td className="p-2">{item.description}</td>
// // // //                           <td className="text-center p-2">{item.quantity}</td>
// // // //                           <td className="text-center p-2">
// // // //                             {item.unitPrice.toLocaleString()}
// // // //                           </td>
// // // //                           <td className="text-left p-2">
// // // //                             {item.total.toLocaleString()} تومان
// // // //                           </td>
// // // //                         </tr>
// // // //                       ))}
// // // //                     </tbody>
// // // //                   </table>
// // // //                 </div>
// // // //               </div>
// // // //             </Card>
// // // //           </div>

// // // //           <div className="lg:col-span-1 space-y-6">
// // // //             <Card>
// // // //               <div className="p-4">
// // // //                 <h2 className="font-semibold text-lg mb-4">خلاصه مالی</h2>
// // // //                 <div className="space-y-2 text-sm">
// // // //                   <div className="flex justify-between">
// // // //                     <span>جمع جزء:</span>
// // // //                     <span>{invoice.subtotal.toLocaleString()} تومان</span>
// // // //                   </div>
// // // //                   <div className="flex justify-between">
// // // //                     <span>تخفیف:</span>
// // // //                     <span className="text-red-600">
// // // //                       - {invoice.discount.toLocaleString()} تومان
// // // //                     </span>
// // // //                   </div>
// // // //                   <div className="flex justify-between">
// // // //                     <span>مالیات:</span>
// // // //                     <span>+ {invoice.tax.toLocaleString()} تومان</span>
// // // //                   </div>
// // // //                   <hr className="my-2" />
// // // //                   <div className="flex justify-between font-bold text-base">
// // // //                     <span>مبلغ کل:</span>
// // // //                     <span>{invoice.total.toLocaleString()} تومان</span>
// // // //                   </div>
// // // //                   <div className="flex justify-between">
// // // //                     <span>پرداخت شده:</span>
// // // //                     <span className="text-green-600">
// // // //                       {totalPaid.toLocaleString()} تومان
// // // //                     </span>
// // // //                   </div>
// // // //                   <div className="flex justify-between font-bold text-base bg-gray-100 p-2 rounded">
// // // //                     <span>مانده حساب:</span>
// // // //                     <span>{balanceDue.toLocaleString()} تومان</span>
// // // //                   </div>
// // // //                 </div>
// // // //               </div>
// // // //             </Card>

// // // //             <Card>
// // // //               <div className="p-4">
// // // //                 <h2 className="font-semibold text-lg mb-4">لیست پرداخت‌ها</h2>
// // // //                 {(invoice?.payments?.length || 0) > 0 ? (
// // // //                   <ul className="space-y-2 text-sm">
// // // //                     {invoice?.payments?.map((p) => (
// // // //                       <li
// // // //                         key={p.id}
// // // //                         className="flex justify-between p-2 bg-gray-50 rounded"
// // // //                       >
// // // //                         <div>
// // // //                           <p className="font-medium">
// // // //                             {p.amount.toLocaleString()} تومان
// // // //                           </p>
// // // //                           <p className="text-xs text-gray-500">
// // // //                             <DateDisplay date={p.createdAt} />
// // // //                           </p>
// // // //                         </div>
// // // //                         <span className="text-gray-600">{p.method}</span>
// // // //                       </li>
// // // //                     ))}
// // // //                   </ul>
// // // //                 ) : (
// // // //                   <p className="text-sm text-gray-500">
// // // //                     هیچ پرداختی ثبت نشده است.
// // // //                   </p>
// // // //                 )}
// // // //               </div>
// // // //             </Card>
// // // //           </div>
// // // //         </div>
// // // //       </div>

// // // //       <Modal
// // // //         isOpen={isStatusModalOpen}
// // // //         onClose={() => setStatusModalOpen(false)}
// // // //         title="تغییر وضعیت فاکتور"
// // // //       >
// // // //         <div className="p-4 space-y-3">
// // // //           <p>وضعیت جدید را انتخاب کنید:</p>
// // // //           <div className="flex flex-col gap-2">
// // // //             <Button
// // // //               variant="primary"
// // // //               outline
// // // //               onClick={() => handleStatusChange("APPROVED")}
// // // //               disabled={submitting || invoice.invoiceStatus === "APPROVED"}
// // // //             >
// // // //               تایید شده
// // // //             </Button>
// // // //             <Button
// // // //               variant="warning"
// // // //               outline
// // // //               onClick={() => handleStatusChange("PENDING")}
// // // //               disabled={submitting || invoice.invoiceStatus === "PENDING"}
// // // //             >
// // // //               در انتظار تایید
// // // //             </Button>
// // // //             <Button
// // // //               variant="error"
// // // //               outline
// // // //               onClick={() => handleStatusChange("CANCELED")}
// // // //               disabled={submitting || invoice.invoiceStatus === "CANCELED"}
// // // //             >
// // // //               لغو شده
// // // //             </Button>
// // // //             <Button variant="ghost" onClick={() => setStatusModalOpen(false)}>
// // // //               انصراف
// // // //             </Button>
// // // //           </div>
// // // //         </div>
// // // //       </Modal>

// // // //       <Modal
// // // //         isOpen={isPaymentModalOpen}
// // // //         onClose={() => setPaymentModalOpen(false)}
// // // //         title="ثبت پرداخت جدید"
// // // //       >
// // // //         <CreatePaymentPage
// // // //           defaultValues={{
// // // //             invoice: invoice,
// // // //             workspaceUser: invoice.workspaceUser,
// // // //             amount: balanceDue > 0 ? balanceDue : invoice.total,
// // // //           }}
// // // //           back={false}
// // // //           after={() => {
// // // //             setPaymentModalOpen(false);
// // // //             fetchInvoiceDetails();
// // // //           }}
// // // //         />
// // // //       </Modal>
// // // //     </>
// // // //   );
// // // // }

// // // // // "use client";

// // // // // import DIcon from "@/@Client/Components/common/DIcon";
// // // // // import Loading from "@/@Client/Components/common/Loading";
// // // // // import NotFound from "@/@Client/Components/common/NotFound";
// // // // // import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
// // // // // import { DetailPageWrapper } from "@/@Client/Components/wrappers";
// // // // // import { ActionButton, CreateActionButton } from "@/@Client/types";
// // // // // import CreatePaymentPage from "@/modules/payments/views/create/page";
// // // // // import { Card } from "ndui-ahrom";
// // // // // import { useEffect, useState } from "react";
// // // // // import { useInvoice } from "../../hooks/useInvoice";
// // // // // import { InvoiceWithRelations } from "../../types";

// // // // // interface InvoiceDetailsViewProps {
// // // // //   id: number;
// // // // //   isAdmin: boolean;
// // // // //   backUrl: string;
// // // // // }

// // // // // export default function DetailPage({ id, isAdmin }: InvoiceDetailsViewProps) {
// // // // //   const {
// // // // //     getById,
// // // // //     loading,
// // // // //     error,
// // // // //     success,
// // // // //     loading: dataLoading,
// // // // //     statusCode,
// // // // //   } = useInvoice();
// // // // //   const [invoice, setInvoice] = useState<InvoiceWithRelations>(
// // // // //     {} as InvoiceWithRelations
// // // // //   );

// // // // //   useEffect(() => {
// // // // //     if (id) {
// // // // //       fetchInvoiceDetails();
// // // // //     }
// // // // //   }, [id]);

// // // // //   const fetchInvoiceDetails = async () => {
// // // // //     try {
// // // // //       const data = await getById(id);
// // // // //       if (data != undefined) setInvoice(data);
// // // // //     } catch (error) {
// // // // //       console.error("Error fetching invoice details:", error);
// // // // //     }
// // // // //   };

// // // // //   const getActionButtons = (): ActionButton[] => {
// // // // //     const buttons: ActionButton[] = [];

// // // // //     buttons.push({
// // // // //       label: "مشاهده درخواست",
// // // // //       href: isAdmin
// // // // //         ? `/dashboard/requests/${invoice?.requestId} `
// // // // //         : `/panel/requests/${invoice?.requestId} `,
// // // // //       icon: <DIcon icon="fa-eye" cdi={false} classCustom="ml-2" />,
// // // // //       variant: "primary",
// // // // //       outline: true,
// // // // //     });
// // // // //     buttons.push({
// // // // //       label: "پیش نمایش چاپ",
// // // // //       href: isAdmin
// // // // //         ? `/dashboard/invoices/${invoice?.id}/print`
// // // // //         : `/panel/invoices/${invoice?.id}/print`,
// // // // //       icon: <DIcon icon="fa-eye" cdi={false} classCustom="ml-2" />,
// // // // //       variant: "primary",
// // // // //       outline: true,
// // // // //     });

// // // // //     return buttons;
// // // // //   };

// // // // //   const getCreateActionButtons = (): CreateActionButton[] => {
// // // // //     const buttons: CreateActionButton[] = [];
// // // // //     if (isAdmin) {
// // // // //       buttons.push({
// // // // //         label: "ثبت پرداخت",
// // // // //         href: isAdmin
// // // // //           ? `/dashboard/requests/${invoice?.requestId}`
// // // // //           : `/panel/requests/${invoice?.requestId}`,
// // // // //         icon: <DIcon icon="fa-save" cdi={false} classCustom="ml-2" />,
// // // // //         modalTitle: "ثبت پرداخت",
// // // // //         modalContent: (closeModal) => (
// // // // //           <CreatePaymentPage
// // // // //             defaultValues={{
// // // // //               invoice: invoice,
// // // // //               workspaceUser: invoice.workspaceUser,
// // // // //               amount: invoice.total,
// // // // //             }}
// // // // //             back={false}
// // // // //             after={() => {
// // // // //               closeModal();
// // // // //               fetchInvoiceDetails();
// // // // //             }}
// // // // //           />
// // // // //         ),
// // // // //       });
// // // // //     }

// // // // //     return buttons;
// // // // //   };

// // // // //   const customRenderers = {
// // // // //     items: (items: any[]) => (
// // // // //       <Card className="p-2 my-4">
// // // // //         <h3 className="text-lg font-semibold mb-4">اقلام فاکتور</h3>
// // // // //         <div className="overflow-x-auto">
// // // // //           <table className="w-full">
// // // // //             <thead>
// // // // //               <tr className="border-b">
// // // // //                 <th className="text-right py-2">شرح</th>
// // // // //                 <th className="text-center py-2">تعداد</th>
// // // // //                 <th className="text-center py-2">قیمت واحد (تومان)</th>
// // // // //                 <th className="text-left py-2">جمع (تومان)</th>
// // // // //               </tr>
// // // // //             </thead>
// // // // //             <tbody>
// // // // //               {items.map((item, index) => (
// // // // //                 <tr key={index} className="border-b">
// // // // //                   <td className="py-2">{item.description}</td>
// // // // //                   <td className="text-center py-2">{item.quantity}</td>
// // // // //                   <td className="text-center py-2">
// // // // //                     {item.unitPrice.toLocaleString()}
// // // // //                   </td>
// // // // //                   <td className="text-left py-2">
// // // // //                     {item.total.toLocaleString()}
// // // // //                   </td>
// // // // //                 </tr>
// // // // //               ))}
// // // // //             </tbody>
// // // // //           </table>
// // // // //         </div>
// // // // //       </Card>
// // // // //     ),
// // // // //     status: (value: string) => (
// // // // //       <span
// // // // //         className={`px-3 py-1 rounded-lg ${
// // // // //           value === "SUCCESS"
// // // // //             ? "bg-success text-success-content"
// // // // //             : value === "FAILED"
// // // // //             ? "bg-error text-error-content"
// // // // //             : value === "CANCELED"
// // // // //             ? "bg-error text-error-content"
// // // // //             : "bg-warning text-warning-content"
// // // // //         }`}
// // // // //       >
// // // // //         {value === "SUCCESS"
// // // // //           ? "موفق"
// // // // //           : value === "FAILED"
// // // // //           ? "ناموفق"
// // // // //           : value === "CANCELED"
// // // // //           ? "لغو شده"
// // // // //           : "در انتظار تایید"}
// // // // //       </span>
// // // // //     ),
// // // // //     createdAt: (value: string) => <DateDisplay date={value} />,
// // // // //     paymentDate: (value: string) =>
// // // // //       value ? <DateDisplay date={value} /> : "پرداخت نشده",
// // // // //     subtotal: (value: number) => `${value.toLocaleString()} تومان`,
// // // // //     tax: (value: number) => `${value.toLocaleString()} تومان`,
// // // // //     discount: (value: number) => `${value.toLocaleString()} تومان`,
// // // // //     total: (value: number) => `${value.toLocaleString()} تومان`,
// // // // //   };

// // // // //   if (dataLoading) return <Loading />;
// // // // //   if (statusCode === 404) return <NotFound />;

// // // // //   return (
// // // // //     <DetailPageWrapper
// // // // //       data={invoice}
// // // // //       title="جزئیات فاکتور"
// // // // //       excludeFields={["id", "updatedAt"]}
// // // // //       actionButtons={getActionButtons()}
// // // // //       createActionButtons={getCreateActionButtons()}
// // // // //       loading={loading}
// // // // //       error={error}
// // // // //       success={success}
// // // // //       customRenderers={customRenderers}
// // // // //       editUrl={isAdmin ? `/dashboard/invoices/${id}/update` : ""}
// // // // //       showDefaultActions
// // // // //     />
// // // // //   );
// // // // // }
