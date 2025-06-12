"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import DateDisplay from "@/@Client/Components/DateTime/DateDisplay";
import { DetailPageWrapper } from "@/@Client/Components/wrappers";
import { ActionButton, CreateActionButton } from "@/@Client/types";
import CreatePaymentPage from "@/modules/payments/views/create/page";
import { Card } from "ndui-ahrom";
import { useEffect, useState } from "react";
import { useInvoice } from "../../hooks/useInvoice";
import { InvoiceWithRelations } from "../../types";

interface InvoiceDetailsViewProps {
  id: number;
  isAdmin: boolean;
  backUrl: string;
}

export default function DetailPage({ id, isAdmin }: InvoiceDetailsViewProps) {
  const {
    getById,
    loading,
    error,
    success,
    loading: dataLoading,
    statusCode,
  } = useInvoice();
  const [invoice, setInvoice] = useState<InvoiceWithRelations>(
    {} as InvoiceWithRelations
  );

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

  const getActionButtons = (): ActionButton[] => {
    const buttons: ActionButton[] = [];

    buttons.push({
      label: "مشاهده درخواست",
      href: isAdmin
        ? `/dashboard/requests/${invoice?.requestId} `
        : `/panel/requests/${invoice?.requestId} `,
      icon: <DIcon icon="fa-eye" cdi={false} classCustom="ml-2" />,
      variant: "primary",
      outline: true,
    });
    buttons.push({
      label: "پیش نمایش چاپ",
      href: isAdmin
        ? `/dashboard/invoices/${invoice?.id}/print`
        : `/panel/invoices/${invoice?.id}/print`,
      icon: <DIcon icon="fa-eye" cdi={false} classCustom="ml-2" />,
      variant: "primary",
      outline: true,
    });

    return buttons;
  };

  const getCreateActionButtons = (): CreateActionButton[] => {
    const buttons: CreateActionButton[] = [];
    if (isAdmin) {
      buttons.push({
        label: "ثبت پرداخت",
        href: isAdmin
          ? `/dashboard/requests/${invoice?.requestId}`
          : `/panel/requests/${invoice?.requestId}`,
        icon: <DIcon icon="fa-save" cdi={false} classCustom="ml-2" />,
        modalTitle: "ثبت پرداخت",
        modalContent: (closeModal) => (
          <CreatePaymentPage
            defaultValues={{
              invoice: invoice,
              user: invoice.request.user,
              amount: invoice.total,
            }}
            back={false}
            after={() => {
              closeModal();
            }}
          />
        ),
      });
    }

    return buttons;
  };

  const customRenderers = {
    items: (items: any[]) => (
      <Card className="p-2 my-4">
        <h3 className="text-lg font-semibold mb-4">اقلام فاکتور</h3>
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
              {items.map((item, index) => (
                <tr key={index} className="border-b">
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
      </Card>
    ),
    status: (value: string) => (
      <span
        className={`px-3 py-1 rounded-lg ${
          value === "PAID"
            ? "bg-success text-success-content"
            : value === "CANCELLED"
            ? "bg-error text-error-content"
            : "bg-warning text-warning-content"
        }`}
      >
        {value === "PAID"
          ? "پرداخت شده"
          : value === "CANCELLED"
          ? "لغو شده"
          : "در انتظار پرداخت"}
      </span>
    ),
    createdAt: (value: string) => <DateDisplay date={value} />,
    paymentDate: (value: string) =>
      value ? <DateDisplay date={value} /> : "پرداخت نشده",
    subtotal: (value: number) => `${value.toLocaleString()} تومان`,
    tax: (value: number) => `${value.toLocaleString()} تومان`,
    discount: (value: number) => `${value.toLocaleString()} تومان`,
    total: (value: number) => `${value.toLocaleString()} تومان`,
  };

  if (dataLoading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <DetailPageWrapper
      data={invoice}
      title="جزئیات فاکتور"
      excludeFields={["id", "updatedAt"]}
      actionButtons={getActionButtons()}
      createActionButtons={getCreateActionButtons()}
      loading={loading}
      error={error}
      success={success}
      customRenderers={customRenderers}
      editUrl={isAdmin ? `/dashboard/invoices/${id}/update` : ""}
      showDefaultActions
    />
  );
}
