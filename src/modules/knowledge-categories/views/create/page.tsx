import { CreateWrapper } from "@/@Client/Components/wrappers";
import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { CreatePageProps } from "@/@Client/types/crud";
import {
  createKnowledgeCategorySchema,
  getCategoryFormConfig,
} from "../../data/form";
import { useKnowledgeCategory } from "../../hooks/useKnowledgeCategory";

class Repo extends BaseRepository<any, number> {
  constructor() {
    super("knowledge-categories");
  }
}

export default function CreateCategoryPage({
  back = true,
  after,
}: CreatePageProps) {
  const { getAll } = useKnowledgeCategory();
  return (
    <CreateWrapper
      fetchers={[
        {
          key: "knowledge-categories",
          fetcher: () =>
            getAll({ page: 1, limit: 1000 }).then((res: any) => res.data),
        },
      ]}
      title="دسته‌بندی جدید پایگاه دانش"
      backUrl={back}
      after={after}
      formConfig={getCategoryFormConfig}
      repo={new Repo()}
      schema={createKnowledgeCategorySchema}
    />
  );
}
