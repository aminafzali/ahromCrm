import { CreateWrapper } from "@/@Client/Components/wrappers";
import { CreatePageProps } from "@/@Client/types/crud";
import {
  createSupportCategorySchema,
  getCategoryFormConfig,
} from "../../data/form";
import { useSupportCategory } from "../../hooks/useSupportCategory";
import { SupportCategoryRepository } from "../../repo/SupportCategoryRepository";

export default function CreateCategoryPage({
  back = true,
  after,
}: CreatePageProps) {
  const { getAll } = useSupportCategory();
  return (
    <CreateWrapper
      fetchers={[
        {
          key: "supports-categories",
          fetcher: () =>
            getAll({ page: 1, limit: 1000 }).then((res) => res.data),
        },
      ]}
      title="دسته‌بندی پشتیبانی جدید"
      backUrl={back}
      after={after}
      formConfig={getCategoryFormConfig}
      repo={new SupportCategoryRepository()}
      schema={createSupportCategorySchema}
    />
  );
}
