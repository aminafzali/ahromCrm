import UpdateWrapper from "@/@Client/Components/wrappers/V2/UpdateWrapper";
import { CreatePageProps } from "@/@Client/types/crud";
import { getCategoryFormConfig } from "@/modules/support-info-categories/data/form";
import { useSupportInfoCategory } from "@/modules/support-info-categories/hooks/useSupportCategory";
import { SupportInfoCategoryRepository } from "@/modules/support-info-categories/repo/SupportCategoryRepository";

export default function UpdateSupportInfoCategoryPage({
  back = true,
  after,
}: CreatePageProps) {
  const { getAll } = useSupportInfoCategory();
  return (
    <UpdateWrapper
      fetchers={[
        {
          key: "support-info-categories",
          fetcher: () =>
            getAll({ page: 1, limit: 1000 }).then((res) => res.data),
        },
      ]}
      title="ویرایش دسته‌بندی پشتیبانی"
      formConfig={getCategoryFormConfig}
      repo={new SupportInfoCategoryRepository()}
      after={after}
      back={back}
    />
  );
}
