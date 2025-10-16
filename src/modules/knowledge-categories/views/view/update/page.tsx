import UpdateWrapper from "@/@Client/Components/wrappers/V2/UpdateWrapper";
import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { CreatePageProps } from "@/@Client/types/crud";
import { getCategoryFormConfig } from "@/modules/knowledge-categories/data/form";
import { useKnowledgeCategory } from "@/modules/knowledge-categories/hooks/useKnowledgeCategory";

class Repo extends BaseRepository<any, number> {
  constructor() {
    super("knowledge-categories");
  }
}

export default function UpdateCategoryPage({
  back = true,
  after,
}: CreatePageProps) {
  const { getAll } = useKnowledgeCategory();
  return (
    <UpdateWrapper
      fetchers={[
        {
          key: "knowledge-categories",
          fetcher: () =>
            getAll({ page: 1, limit: 1000 }).then((res: any) => res.data),
        },
      ]}
      title="ویرایش دسته‌بندی پایگاه دانش"
      formConfig={getCategoryFormConfig}
      repo={new Repo()}
      after={after}
      back={back}
    />
  );
}
