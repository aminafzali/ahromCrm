import { CreatePageProps } from "@/@Client/types/crud";

import UpdateWrapper from "@/@Client/Components/wrappers/V2/UpdateWrapper";
import { getCategoryFormConfig } from "@/modules/payment-categories/data/form";
import { usePaymentCategory } from "@/modules/payment-categories/hooks/usePaymentCategory";
import { PaymentCategoryRepository } from "@/modules/payment-categories/repo/PaymentCategoryRepository";

export default function CreateUserPage({
  back = true,
  after,
  defaultValues,
}: CreatePageProps) {
  const { getAll } = usePaymentCategory();

  return (
    <UpdateWrapper
      fetchers={[
        {
          key: "payment-categories",
          fetcher: () => getAll({ page: 1, limit: 50 }).then((res) => res.data),
        },
      ]}
      title="دسته‌بندی جدید"
      formConfig={getCategoryFormConfig}
      repo={new PaymentCategoryRepository()}
      after={after}
      back={back}
    />
  );
}
