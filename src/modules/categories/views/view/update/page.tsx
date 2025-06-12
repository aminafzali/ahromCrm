import { CreatePageProps } from "@/@Client/types/crud";

import UpdateWrapper from "@/@Client/Components/wrappers/V2/UpdateWrapper";
import { getCategoryFormConfig } from "@/modules/categories/data/form";
import { useCategory } from "@/modules/categories/hooks/useCategory";
import { CategoryRepository } from "@/modules/categories/repo/CategoryRepository";

export default function CreateUserPage({
  back = true,
  after,
  defaultValues,
}: CreatePageProps) {
  const { getAll } = useCategory();

  return (
    <UpdateWrapper
      fetchers={[
        {
          key: "categories",
          fetcher: () => getAll({ page: 1, limit: 50 }).then((res) => res.data),
        },
      ]}
      title="دسته‌بندی جدید"
      formConfig={getCategoryFormConfig}
      repo={new CategoryRepository()}
      after={after}
      back={back}
    />
  );
}
