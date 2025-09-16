// مسیر فایل: src/modules/tasks/views/view/update/page.tsx

"use client";
import UpdateWrapper from "@/@Client/Components/wrappers/V2/UpdateWrapper";
import { CreatePageProps } from "@/@Client/types/crud"; // اصلاح شد
import { usePMStatus } from "@/modules/pm-statuses/hooks/usePMStatus";
import { useProject } from "@/modules/projects/hooks/useProject";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { getUpdateFormConfig } from "../../../data/form";
import { TaskRepository } from "../../../repo/TaskRepository";
import { updateTaskSchema } from "../../../validation/schema";

export default function UpdatePage({ after, back = true }: CreatePageProps) { // اصلاح شد
    const { getAll: getAllWorkspaceUsers } = useWorkspaceUser();
    const { getAll: getAllProjects } = useProject();
    const { getAll: getAllPMStatuses } = usePMStatus();
  
    return (
      <UpdateWrapper
        title="ویرایش وظیفه"
      //  backUrl={back}
        after={after}
        repo={new TaskRepository()}
        schema={updateTaskSchema}
        formConfig={getUpdateFormConfig}
        fetchers={[
            {
              key: "workspaceUsers",
              fetcher: () =>
                getAllWorkspaceUsers({ page: 1, limit: 1000 }).then(
                  (res) => res?.data || []
                ),
            },
            {
              key: "projects",
              fetcher: () =>
                getAllProjects({ page: 1, limit: 1000 }).then(
                  (res) => res?.data || []
                ),
            },
            {
              key: "taskStatuses",
              fetcher: () =>
                getAllPMStatuses({ page: 1, limit: 100, where: "type:TASK" }).then(
                  (res) => res?.data || []
                ),
            },
          ]}
      />
    );
  }