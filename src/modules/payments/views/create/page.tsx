"use client";

import CreateWrapper from "@/@Client/Components/wrappers/V2/CreateWrapper";
import { CreatePageProps } from "@/@Client/types/crud";
import { useInvoice } from "@/modules/invoices/hooks/useInvoice";
import { useUser } from "@/modules/users/hooks/useUser";
import { getPaymentFormConfig } from "../../data/form";
import { PaymentRepository } from "../../repo/PaymentRepository";
import { createPaymentSchema } from "../../validation/schema";

export default function CreatePaymentPage({
  back = true,
  defaultValues,
  after,
}: CreatePageProps) {
  const { getAll: getAllUsers } = useUser();
  const { getAll: getAllInvoices } = useInvoice();

  return (
    <CreateWrapper
      fetchers={[
        {
          key: "users",
          fetcher: () =>
            getAllUsers({ page: 1, limit: 50 }).then((res) => res.data),
        },
        {
          key: "invoices",
          fetcher: () =>
            getAllInvoices({ page: 1, limit: 50 }).then((res) => res.data),
        },
      ]}
      title="پرداخت جدید"
      backUrl={back}
      formConfig={getPaymentFormConfig}
      after={after}
      repo={new PaymentRepository()}
      schema={createPaymentSchema}
      defaultValues={defaultValues}
    />
  );
}
