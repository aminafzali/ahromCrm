// مسیر فایل: src/modules/workspace-users/views/create/page.tsx

"use client";

import UpdateWrapper from "@/@Client/Components/wrappers/V2/UpdateWrapper";
import { CreatePageProps } from "@/@Client/types/crud";
import { useLabel } from "@/modules/labels/hooks/useLabel"; // ۱. هوک ماژول برچسب را ایمپورت می‌کنیم
import { useRole } from "@/modules/roles/hooks/useRole";
import { useUserGroup } from "@/modules/user-groups/hooks/useUserGroup";
import { getUpdateFormConfig } from "../../../data/form";
import { WorkspaceUserRepository } from "../../../repo/WorkspaceUserRepository";
import { updateWorkspaceUserSchema } from "../../../validation/schema";

// الگوبرداری دقیق از ماژول products/views/create/page.tsx
export default function CreateWorkspaceUserPage({
  back = true,
  after,
}: CreatePageProps) {
  // ۳. هوک‌های مورد نیاز را برای دسترسی به متد getAll آن‌ها فراخوانی می‌کنیم
  const { getAll: getAllRoles } = useRole();
  const { getAll: getAllLabels } = useLabel();
  const { getAll: getAllUserGroups } = useUserGroup();

  return (
    <UpdateWrapper
      // ۴. fetcher های صحیح را به لیست اضافه می‌کنیم
      fetchers={[
        {
          key: "roles",
          fetcher: () =>
            getAllRoles({ page: 1, limit: 100 }).then((res) => res?.data || []),
        },
        {
          key: "labels",
          fetcher: () =>
            getAllLabels({ page: 1, limit: 100 }).then(
              (res) => res?.data || []
            ),
        },
        {
          key: "userGroupId", // تغییر به one-to-one
          fetcher: () =>
            getAllUserGroups({ page: 1, limit: 100 }).then(
              (res) => res?.data || []
            ),
        },
      ]}
      title="دعوت عضو جدید"
      after={after}
      formConfig={getUpdateFormConfig}
      repo={new WorkspaceUserRepository()}
      schema={updateWorkspaceUserSchema}
    />
  );
}
