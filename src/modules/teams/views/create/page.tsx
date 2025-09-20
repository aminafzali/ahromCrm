"use client";
import { CreateWrapper } from "@/@Client/Components/wrappers";
import { CreatePageProps } from "@/@Client/types/crud";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { getCreateFormConfig } from "../../data/form";
import { useTeam } from "../../hooks/useTeam";
import { TeamRepository } from "../../repo/TeamRepository";
import { createTeamSchema } from "../../validation/schema";

export default function CreatePage({ back = true, after }: CreatePageProps) {
  const { getAll: getAllWorkspaceUsers } = useWorkspaceUser();
  const { getAll: getAllTeams } = useTeam(); // <-- هوک تیم اضافه شد

  return (
    <CreateWrapper
      title="ایجاد تیم جدید"
      backUrl={back}
      after={after}
      repo={new TeamRepository()}
      schema={createTeamSchema}
      formConfig={getCreateFormConfig}
      fetchers={[
        {
          key: "workspaceUsers",
          fetcher: () =>
            getAllWorkspaceUsers({ page: 1, limit: 1000 }).then(
              (res) => res?.data || []
            ),
        },
        // ===== واکشی لیست تیم‌ها برای فیلد والد =====
        {
          key: "teams",
          fetcher: () =>
            getAllTeams({ page: 1, limit: 1000 }).then(
              (res) =>
                res?.data.map((team) => ({
                  label: team.name,
                  value: team.id,
                })) || []
            ),
        },
      ]}
    />
  );
}
