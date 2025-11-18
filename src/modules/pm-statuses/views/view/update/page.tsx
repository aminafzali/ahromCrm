// مسیر فایل: src/modules/pm-statuses/views/view/update/page.tsx

"use client";
import UpdateWrapper from "@/@Client/Components/wrappers/V2/UpdateWrapper";
import { CreatePageProps } from "@/@Client/types/crud"; // اصلاح شد
import { useProject } from "@/modules/projects/hooks/useProject";
import { getUpdateFormConfig } from "../../../data/form";
import { PMStatusRepository } from "../../../repo/PMStatusRepository";
import { updatePMStatusSchema } from "../../../validation/schema";

export default function UpdatePage({ after, back = true }: CreatePageProps) {
  // اصلاح شد
  const { getAll: getAllProjects } = useProject();

  return (
    <UpdateWrapper
      title="ویرایش وضعیت"
      //  backUrl={back}
      after={after}
      formConfig={getUpdateFormConfig}
      repo={new PMStatusRepository()}
      schema={updatePMStatusSchema}
      // fetchers برای هماهنگی با الگو اضافه شد
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
