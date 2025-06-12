import DIcon from "@/@Client/Components/common/DIcon";
import ButtonCreate from "@/components/ButtonCreate/ButtonCreate";
import CreatePaymentPage from "@/modules/payments/views/create/page";
import { Button, Card } from "ndui-ahrom";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getStatusColor, getStatusLabel } from "../data/statusOptions";
import { useInvoice } from "../hooks/useInvoice";
import { InvoiceWithRelations } from "../types";

interface InvoiceDetailsProps {
  id: number;
  isAdmin?: boolean;
  onPayment?: (invoiceId: number) => Promise<void>;
}

export default function InvoiceDetails({
  id,
  isAdmin = false,
  onPayment,
}: InvoiceDetailsProps) {
  const { getById, loading, error } = useInvoice();
  const [invoice, setInvoice] = useState<InvoiceWithRelations | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchInvoiceDetails();
    }
  }, [id]);

  const fetchInvoiceDetails = async () => {
    try {
      const data = await getById(id);
      setInvoice(data);
    } catch (error) {
      console.error("Error fetching invoice details:", error);
    }
  };

  const handlePayment = async () => {
    if (!onPayment) return;

    setPaymentLoading(true);
    try {
      await onPayment(id);
      // Refresh invoice details after payment
      fetchInvoiceDetails();
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading && !invoice) {
    return <div className="text-center py-8">در حال بارگذاری...</div>;
  }

  if (error && !invoice) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!invoice) {
    return <div className="text-center py-8">صورتحساب یافت نشد</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">اطلاعات مخاطب</h2>
            <div className="space-y-2">
              <p>
                <strong>نام:</strong> {invoice.request.user.name || "نامشخص"}
              </p>
              <p>
                <strong>شماره تماس:</strong> {invoice.request.user.phone}
              </p>
              <p>
                <strong>آدرس:</strong>{" "}
                {invoice.request.user.address || "نامشخص"}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">اطلاعات درخواست</h2>
            <div className="space-y-2">
              <p>
                <strong>شماره درخواست:</strong> {invoice.request.id.toString()}
              </p>
              <p>
                <strong>نوع خدمات:</strong>{" "}
                {invoice.request &&
                  invoice.request.serviceType &&
                  invoice.request.serviceType.name}
              </p>
              <p>
                <strong>تاریخ:</strong>{" "}
                {new Date(invoice.createdAt).toLocaleDateString("fa-IR")}
              </p>
              <p>
                <strong>وضعیت پرداخت:</strong>{" "}
                <span
                  className={`py-2 px-4 rounded-lg bg-${getStatusColor(
                    invoice.status
                  )}`}
                >
                  {getStatusLabel(invoice.status)}
                </span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">اقلام صورتحساب</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-2">شرح</th>
                  <th className="text-center py-2">تعداد</th>
                  <th className="text-center py-2">قیمت واحد (تومان)</th>
                  <th className="text-left py-2">جمع (تومان)</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id.toString()} className="border-b">
                    <td className="py-2">{item.description}</td>
                    <td className="text-center py-2">{item.quantity}</td>
                    <td className="text-center py-2">
                      {item.price.toLocaleString()}
                    </td>
                    <td className="text-left py-2">
                      {item.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <span>جمع کل:</span>
            <span>{invoice.subtotal.toLocaleString()} تومان</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span>مالیات (9%):</span>
            <span>{invoice.tax.toLocaleString()} تومان</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between items-center mb-4">
              <span>تخفیف:</span>
              <span>{invoice.discount.toLocaleString()} تومان</span>
            </div>
          )}
          <div className="flex justify-between items-center text-lg font-bold">
            <span>مبلغ قابل پرداخت:</span>
            <span>{invoice.total.toLocaleString()} تومان</span>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <div>
                <p>
                  <strong>وضعیت پرداخت:</strong>{" "}
                  <span className={`text-${getStatusColor(invoice.status)}`}>
                    {getStatusLabel(invoice.status)}
                  </span>
                </p>
                {invoice.paymentDate && (
                  <p>
                    <strong>تاریخ پرداخت:</strong>{" "}
                    {new Date(invoice.paymentDate).toLocaleDateString("fa-IR")}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {!isAdmin && invoice.status === "PENDING" && onPayment && (
                  <Button
                    onClick={handlePayment}
                    disabled={paymentLoading}
                    icon={
                      <DIcon
                        icon="fa-credit-card"
                        cdi={false}
                        classCustom="ml-2"
                      />
                    }
                  >
                    {paymentLoading ? "در حال پردازش..." : "پرداخت صورتحساب"}
                  </Button>
                )}

                {isAdmin && (
                  <>
                    <ButtonCreate
                      modalTitle="ثبت پرداخت"
                      modalContent={(closeModal) => (
                        <CreatePaymentPage
                          defaultValues={{
                            invoice: invoice,
                            user: invoice.request.user,
                            amount: invoice.total,
                          }}
                          after={() => {
                            closeModal();
                            fetchInvoiceDetails();
                          }}
                        />
                      )}
                    >
                      ثبت پرداخت
                    </ButtonCreate>

                    <Link href={`/dashboard/requests/${invoice.requestId}`}>
                      <Button
                        variant="ghost"
                        icon={
                          <DIcon icon="fa-eye" cdi={false} classCustom="ml-2" />
                        }
                      >
                        مشاهده درخواست
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
