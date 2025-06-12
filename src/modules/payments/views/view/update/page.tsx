"use client";

import UpdateWrapper from "@/@Client/Components/wrappers/V2/UpdateWrapper";
import { useInvoice } from "@/modules/invoices/hooks/useInvoice";
import { useUser } from "@/modules/users/hooks/useUser";
import { getPaymentFormConfig } from "../../../data/form";
import { PaymentRepository } from "../../../repo/PaymentRepository";
import { createPaymentSchema } from "../../../validation/schema";

interface UpdatePaymentPageProps {
  id: number;
}

export default function UpdatePaymentPage({ id }: UpdatePaymentPageProps) {
  const { getAll: getAllUsers } = useUser();
  const { getAll: getAllInvoices } = useInvoice();

  return (
    <UpdateWrapper
      title="ویرایش پرداخت"
      formConfig={getPaymentFormConfig}
      fetchers={[
        {
          key: "users",
          fetcher: () => getAllUsers({ page: 1, limit: 50 }).then((res) => res.data),
        },
        {
          key: "invoices",
          fetcher: () => getAllInvoices({ page: 1, limit: 50 }).then((res) => res.data),
        },
      ]}
      repo={new PaymentRepository()}
      schema={createPaymentSchema}
    />
  );
}