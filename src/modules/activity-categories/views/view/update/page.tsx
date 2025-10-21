import UpdateWrapper from "@/@Client/Components/wrappers/V2/UpdateWrapper";
import { CreatePageProps } from "@/@Client/types/crud";
import { getCategoryFormConfig } from "@/modules/activity-categories/data/form";
import { useActivityCategory } from "@/modules/activity-categories/hooks/useActivityCategory";
import { ActivityCategoryRepository } from "@/modules/activity-categories/repo/ActivityCategoryRepository";

export default function UpdateActivityCategoryPage({
  back = true,
  after,
}: CreatePageProps) {
  const { getAll } = useActivityCategory();
  return (
    <UpdateWrapper
      fetchers={[
        {
          key: "activity-categories",
          fetcher: () =>
            getAll({ page: 1, limit: 1000 }).then((res) => res.data),
        },
      ]}
      title="ویرایش دسته‌بندی فعالیت"
      formConfig={getCategoryFormConfig}
      repo={new ActivityCategoryRepository()}
      after={after}
      back={back}
    />
  );
}
