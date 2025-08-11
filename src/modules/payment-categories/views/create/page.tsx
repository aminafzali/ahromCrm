import { CreateWrapper } from "@/@Client/Components/wrappers";
import { CreatePageProps } from "@/@Client/types/crud";
import { getCategoryFormConfig } from "../../data/form";
import { usePaymentCategory } from "../../hooks/usePaymentCategory";
import { PaymentCategoryRepository } from "../../repo/PaymentCategoryRepository";
import { createPaymentCategorySchema } from "../../validation/schema";

export default function CreateCategoryPage({
  back = true,
  after,
  defaultValues,
}: CreatePageProps) {
  const { getAll } = usePaymentCategory();
  return (
    <CreateWrapper
      fetchers={[
        {
          key: "payment-categories",
          fetcher: () => getAll({ page: 1, limit: 50 }).then((res) => res.data),
        },
      ]}
      title="دسته‌بندی جدید"
      backUrl={back}
      defaultValues={defaultValues}
      formConfig={getCategoryFormConfig}
      repo={new PaymentCategoryRepository()}
      schema={createPaymentCategorySchema}
      after={after}
    />
  );
}
