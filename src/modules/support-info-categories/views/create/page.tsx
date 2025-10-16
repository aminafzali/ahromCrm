import { CreateWrapper } from "@/@Client/Components/wrappers";
import { CreatePageProps } from "@/@Client/types/crud";
import {
  createSupportInfoCategorySchema,
  getCategoryFormConfig,
} from "../../data/form";
import { useSupportInfoCategory } from "../../hooks/useSupportCategory";
import { SupportInfoCategoryRepository } from "../../repo/SupportCategoryRepository";

export default function CreateSupportInfoCategoryPage({
  back = true,
  after,
}: CreatePageProps) {
  const { getAll } = useSupportInfoCategory();
  return (
    <CreateWrapper
      fetchers={[
        {
          key: "support-info-categories",
          fetcher: () =>
            getAll({ page: 1, limit: 1000 }).then((res) => res.data),
        },
      ]}
      title="دسته‌بندی پشتیبانی جدید"
      backUrl={back}
      after={after}
      formConfig={getCategoryFormConfig}
      repo={new SupportInfoCategoryRepository()}
      schema={createSupportInfoCategorySchema}
    />
  );
}
