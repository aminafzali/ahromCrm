// // مسیر فایل: src/modules/pm-statuses/views/create/page.tsx

"use client";
import { CreateWrapper } from "@/@Client/Components/wrappers";
import { CreatePageProps } from "@/@Client/types/crud";
import { useProject } from "@/modules/projects/hooks/useProject";
import { getCreateFormConfig } from "../../data/form";
import { PMStatusRepository } from "../../repo/PMStatusRepository";
import { createPMStatusSchema } from "../../validation/schema";

export default function CreatePage({ back = true, after }: CreatePageProps) {
  const { getAll: getAllProjects } = useProject();

  return (
    <CreateWrapper
      title="ایجاد وضعیت جدید"
      backUrl={back}
      after={after}
      formConfig={getCreateFormConfig}
      repo={new PMStatusRepository()}
      schema={createPMStatusSchema}
      fetchers={[
        {
          key: "projects",
          fetcher: () =>
            getAllProjects({ page: 1, limit: 1000 }).then(
              (res) => res?.data || []
            ),
        },
      ]}
    />
  );
}
