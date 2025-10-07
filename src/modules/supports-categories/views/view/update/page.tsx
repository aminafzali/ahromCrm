import UpdateWrapper from "@/@Client/Components/wrappers/V2/UpdateWrapper";
import { CreatePageProps } from "@/@Client/types/crud";
import { getCategoryFormConfig } from "@/modules/supports-categories/data/form";
import { useSupportCategory } from "@/modules/supports-categories/hooks/useSupportCategory";
import { SupportCategoryRepository } from "@/modules/supports-categories/repo/SupportCategoryRepository";

export default function UpdateCategoryPage({
  back = true,
  after,
}: CreatePageProps) {
  const { getAll } = useSupportCategory();
  return (
    <UpdateWrapper
      fetchers={[
        {
          key: "supports-categories",
          fetcher: () =>
            getAll({ page: 1, limit: 1000 }).then((res) => res.data),
        },
      ]}
      title="ویرایش دسته‌بندی پشتیبانی"
      formConfig={getCategoryFormConfig}
      repo={new SupportCategoryRepository()}
      after={after}
      back={back}
    />
  );
}
