import DIcon from "@/@Client/Components/common/DIcon";
import Loading from "@/@Client/Components/common/Loading";
import NotFound from "@/@Client/Components/common/NotFound";
import { DetailWrapper } from "@/@Client/Components/wrappers";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePayment } from "../../hooks/usePayment";
import { PaymentWithRelations } from "../../types";

interface PaymentDetailsViewProps {
  id: number;
  isAdmin: boolean;
  backUrl: string;
}

export default function DetailPage({ id, isAdmin }: PaymentDetailsViewProps) {
  const {
    getById,
    loading,
    error,
    success,
    loading: dataLoading,
    statusCode,
  } = usePayment();
  const [payment, setPayment] = useState<PaymentWithRelations>(
    {} as PaymentWithRelations
  );

  useEffect(() => {
    if (id) {
      fetchPaymentDetails();
    }
  }, [id]);

  const fetchPaymentDetails = async () => {
    try {
      const data = await getById(id);
      if (data != undefined) setPayment(data);
    } catch (error) {
      console.error("Error fetching payment details:", error);
    }
  };

  const customRenderers = {
    amount: (value: number) => `${value.toLocaleString()} تومان`,
    method: (value: string) => {
      const methods = {
        CASH: "نقدی",
        CARD: "کارت",
        TRANSFER: "انتقال",
      };
      return methods[value] || value;
    },
    status: (value: string) => (
      <span
        className={`px-3 py-1 rounded-lg ${
          value === "SUCCESS"
            ? "bg-success text-success-content"
            : value === "FAILED"
            ? "bg-error text-error-content"
            : "bg-warning text-warning-content"
        }`}
      >
        {value === "SUCCESS"
          ? "موفق"
          : value === "FAILED"
          ? "ناموفق"
          : "در انتظار"}
      </span>
    ),
    invoice: (value: any) =>
      value ? (
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-semibold">شماره فاکتور: {value.id}</p>
            <p className="text-gray-600">
              {value.request?.serviceType?.name || "نامشخص"}
            </p>
          </div>
          <Link href={`/dashboard/invoices/${value.id}`}>
            <button className="btn btn-ghost btn-sm">
              <DIcon icon="fa-eye" cdi={false} classCustom="ml-2" />
              مشاهده فاکتور
            </button>
          </Link>
        </div>
      ) : (
        "بدون فاکتور"
      ),
  };

  if (dataLoading) return <Loading />;
  if (statusCode === 404) return <NotFound />;

  return (
    <DetailWrapper
      data={payment}
      title="جزئیات پرداخت"
      excludeFields={["id", "createdAt", "updatedAt"]}
      loading={loading}
      error={error}
      success={success}
      customRenderers={customRenderers}
      showDefaultActions={false}
    />
  );
}
