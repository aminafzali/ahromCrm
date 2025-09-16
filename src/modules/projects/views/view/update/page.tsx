// مسیر فایل: src/modules/projects/views/view/update/page.tsx

"use client";
import UpdateWrapper from "@/@Client/Components/wrappers/V2/UpdateWrapper";
import { CreatePageProps } from "@/@Client/types/crud"; // اصلاح شد
import { usePMStatus } from "@/modules/pm-statuses/hooks/usePMStatus";
import { useTeam } from "@/modules/teams/hooks/useTeam";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { getUpdateFormConfig } from "../../../data/form";
import { ProjectRepository } from "../../../repo/ProjectRepository";
import { updateProjectSchema } from "../../../validation/schema";

export default function UpdatePage({ after, back = true }: CreatePageProps) { // اصلاح شد
    const { getAll: getAllWorkspaceUsers } = useWorkspaceUser();
    const { getAll: getAllTeams } = useTeam();
    const { getAll: getAllPMStatuses } = usePMStatus();
  
    return (
      <UpdateWrapper
        title="ویرایش پروژه"
       // backUrl={back}
        after={after}
        repo={new ProjectRepository()}
        schema={updateProjectSchema}
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
            key: "teams",
            fetcher: () =>
              getAllTeams({ page: 1, limit: 1000 }).then((res) => res?.data || []),
          },
          {
            key: "projectStatuses",
            fetcher: () =>
              getAllPMStatuses({ page: 1, limit: 100, where: "type:PROJECT" }).then(
                (res) => res?.data || []
              ),
          },
        ]}
      />
    );
  }