// مسیر فایل: src/modules/tasks/views/create/page.tsx

"use client";
import { CreateWrapper } from "@/@Client/Components/wrappers";
import { CreatePageProps } from "@/@Client/types/crud";
import { usePMStatus } from "@/modules/pm-statuses/hooks/usePMStatus";
import { useProject } from "@/modules/projects/hooks/useProject";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { getCreateFormConfig } from "../../data/form";
import { TaskRepository } from "../../repo/TaskRepository";
import { createTaskSchema } from "../../validation/schema";

export default function CreatePage({ back = true, after }: CreatePageProps) {
  const { getAll: getAllWorkspaceUsers } = useWorkspaceUser();
  const { getAll: getAllProjects } = useProject();
  const { getAll: getAllPMStatuses } = usePMStatus();

  return (
    <CreateWrapper
      title="ایجاد وظیفه جدید"
      backUrl={back}
      after={after}
      repo={new TaskRepository()}
      schema={createTaskSchema}
      formConfig={getCreateFormConfig}
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
