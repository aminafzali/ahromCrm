import { CreateWrapper } from "@/@Client/Components/wrappers";
import { CreatePageProps } from "@/@Client/types/crud";
import { getCategoryFormConfig } from "../../data/form";
import { useCategory } from "../../hooks/useCategory";
import { CategoryRepository } from "../../repo/CategoryRepository";
import { createCategorySchema } from "../../validation/schema";

export default function CreateCategoryPage({
  back = true,
  after,
  defaultValues,
}: CreatePageProps) {
  const { getAll } = useCategory();
  return (
    <CreateWrapper
      fetchers={[
        {
          key: "categories",
          fetcher: () => getAll({ page: 1, limit: 50 }).then((res) => res.data),
        },
      ]}
      title="دسته‌بندی جدید"
      backUrl={back}
      defaultValues={defaultValues}
      formConfig={getCategoryFormConfig}
      repo={new CategoryRepository()}
      schema={createCategorySchema}
      after={after}
    />
  );
}
