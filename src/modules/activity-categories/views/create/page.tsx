import { CreateWrapper } from "@/@Client/Components/wrappers";
import { CreatePageProps } from "@/@Client/types/crud";
import {
  createActivityCategorySchema,
  getCategoryFormConfig,
} from "../../data/form";
import { useActivityCategory } from "../../hooks/useActivityCategory";
import { ActivityCategoryRepository } from "../../repo/ActivityCategoryRepository";

export default function CreateActivityCategoryPage({
  back = true,
  after,
}: CreatePageProps) {
  const { getAll } = useActivityCategory();
  return (
    <CreateWrapper
      fetchers={[
        {
          key: "activity-categories",
          fetcher: () =>
            getAll({ page: 1, limit: 1000 }).then((res) => res.data),
        },
      ]}
      title="دسته‌بندی فعالیت جدید"
      backUrl={back}
      after={after}
      formConfig={getCategoryFormConfig}
      repo={new ActivityCategoryRepository()}
      schema={createActivityCategorySchema}
    />
  );
}
