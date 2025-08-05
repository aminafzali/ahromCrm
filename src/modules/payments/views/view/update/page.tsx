"use client";

import UpdateWrapper from "@/@Client/Components/wrappers/V2/UpdateWrapper";
import { useInvoice } from "@/modules/invoices/hooks/useInvoice";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { getPaymentFormConfig } from "../../../data/form";
import { PaymentRepository } from "../../../repo/PaymentRepository";
import { createPaymentSchema } from "../../../validation/schema";

interface UpdatePaymentPageProps {
  id: number;
}

export default function UpdatePaymentPage({ id }: UpdatePaymentPageProps) {
  const { getAll: getAllWorkspaceUsers } = useWorkspaceUser();
  const { getAll: getAllInvoices } = useInvoice();

  return (
    <UpdateWrapper
      title="ویرایش پرداخت"
      formConfig={getPaymentFormConfig}
      fetchers={[
        {
          key: "WorkspaceUsers",
          fetcher: () => getAllWorkspaceUsers({ page: 1, limit: 50 }).then((res) => res.data),
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