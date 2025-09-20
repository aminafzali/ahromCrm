// // مسیر فایل: src/modules/teams/views/view/update/page.tsx
"use client";
import UpdateWrapper from "@/@Client/Components/wrappers/V2/UpdateWrapper";
import { CreatePageProps } from "@/@Client/types/crud";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { getUpdateFormConfig } from "../../../data/form";
import { useTeam } from "../../../hooks/useTeam"; // <-- ایمپورت هوک تیم
import { TeamRepository } from "../../../repo/TeamRepository";
import { updateTeamSchema } from "../../../validation/schema";

export default function UpdatePage({ after }: CreatePageProps) {
  const { getAll: getAllWorkspaceUsers } = useWorkspaceUser();
  const { getAll: getAllTeams } = useTeam(); // <-- استفاده از هوک تیم

  return (
    <UpdateWrapper
      title="ویرایش تیم"
      //  backUrl={backUrl}
      after={after}
      repo={new TeamRepository()}
      schema={updateTeamSchema}
      formConfig={getUpdateFormConfig}
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
// import UpdateWrapper from "@/@Client/Components/wrappers/V2/UpdateWrapper";
// import { CreatePageProps } from "@/@Client/types/crud"; // اصلاح شد
// import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
// import { getUpdateFormConfig } from "../../../data/form";
// import { TeamRepository } from "../../../repo/TeamRepository";
// import { updateTeamSchema } from "../../../validation/schema";

// export default function UpdatePage({ after, back = true }: CreatePageProps) {
//   // اصلاح شد
//   const { getAll: getAllWorkspaceUsers } = useWorkspaceUser();

//   return (
//     <UpdateWrapper
//       title="ویرایش تیم"
//     //  backUrl={back}
//       after={after}
//       repo={new TeamRepository()}
//       schema={updateTeamSchema}
//       formConfig={getUpdateFormConfig}
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
