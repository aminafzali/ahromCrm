// مسیر فایل: src/modules/notifications/views/create/page.tsx

"use client";

import { CreateWrapper } from "@/@Client/Components/wrappers";
import { CreatePageProps } from "@/@Client/types/crud";
import { useWorkspaceUser } from "@/modules/workspace-users/hooks/useWorkspaceUser";
import { getCreateFormConfig } from "../../data/form";
import { NotificationRepository } from "../../repo/NotificationRepository";
import { createNotificationSchema } from "../../validation/schema";

export default function CreateNotificationPage({
  back = true,
  after,
}: CreatePageProps) {
  const { getAll: getAllWorkspaceUsers } = useWorkspaceUser();

  return (
    <CreateWrapper
      fetchers={[
        {
          key: "workspaceUsers",
          fetcher: () =>
            getAllWorkspaceUsers({ page: 1, limit: 1000 }).then(
              (res) => res.data
            ),
        },
      ]}
      title="ارسال اطلاع‌رسانی جدید"
      backUrl={back}
      after={after}
      formConfig={getCreateFormConfig}
      repo={new NotificationRepository()}
      schema={createNotificationSchema}
    />
  );
}
