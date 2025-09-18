// // مسیر فایل: src/modules/teams/views/create/page.tsx
"use client";
import { CreateWrapper } from "@/@Client/Components/wrappers";
import { CreatePageProps } from "@/@Client/types/crud";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { getCreateFormConfig } from "../../data/form";
import { useTeam } from "../../hooks/useTeam"; // <-- ایمپورت هوک تیم
import { TeamRepository } from "../../repo/TeamRepository";
import { createTeamSchema } from "../../validation/schema";

export default function CreatePage({ back = true, after }: CreatePageProps) {
  const { getAll: getAllWorkspaceUsers } = useWorkspaceUser();
  const { getAll: getAllTeams } = useTeam(); // <-- استفاده از هوک تیم

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
        // ===== شروع کد جدید =====
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
        // ===== پایان کد جدید =====
      ]}
    />
  );
}

// "use client";
// import { CreateWrapper } from "@/@Client/Components/wrappers";
// import { CreatePageProps } from "@/@Client/types/crud";
// import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
// import { getCreateFormConfig } from "../../data/form";
// import { TeamRepository } from "../../repo/TeamRepository";
// import { createTeamSchema } from "../../validation/schema";

// export default function CreatePage({ back = true, after }: CreatePageProps) {
//   const { getAll: getAllWorkspaceUsers } = useWorkspaceUser();

//   return (
//     <CreateWrapper
//       title="ایجاد تیم جدید"
//       backUrl={back}
//       after={after}
//       repo={new TeamRepository()}
//       schema={createTeamSchema}
//       formConfig={getCreateFormConfig}
//       fetchers={[
//         {
//           key: "workspaceUsers",
//           fetcher: () =>
//             getAllWorkspaceUsers({ page: 1, limit: 1000 }).then(
//               (res) => res?.data || []
//             ),
//         },
//       ]}
//     />
//   );
// }
