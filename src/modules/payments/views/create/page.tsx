// مسیر فایل: src/modules/payments/views/create/page.tsx

"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import { CreatePageProps } from "@/@Client/types/crud";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PaymentForm from "../../components/PaymentForm";
import { usePayment } from "../../hooks/usePayment";

export default function CreatePaymentPage({
  back = true,
  defaultValues,
  after,
}: CreatePageProps) {
  const router = useRouter();
  const { create, submitting, error } = usePayment();

  const handleSubmit = async (data: any) => {
    try {
      await create(data);
      if (after) {
        after();
      } else {
        router.push("/dashboard/payments");
      }
    } catch (err) {
      console.error("Error creating payment:", err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ثبت پرداخت جدید</h1>
        {back && (
          <Link
            href="/dashboard/payments"
            className="flex justify-start items-center"
          >
            <button className="btn btn-ghost">
              <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
              بازگشت به لیست پرداخت‌ها
            </button>
          </Link>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <PaymentForm
        onSubmit={handleSubmit}
        loading={submitting}
        defaultValues={defaultValues}
      />
    </div>
  );
}
