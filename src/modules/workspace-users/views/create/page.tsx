// مسیر فایل: src/modules/workspace-users/views/create/page.tsx

"use client";

import { CreateWrapper } from "@/@Client/Components/wrappers";
import { CreatePageProps } from "@/@Client/types/crud";
import { useRole } from "@/modules/roles/hooks/useRole"; // ۱. هوک ماژول نقش‌ها را ایمپورت می‌کنیم
import { getCreateFormConfig } from "../../data/form";
import { WorkspaceUserRepository } from "../../repo/WorkspaceUserRepository";
import { createWorkspaceUserSchema } from "../../validation/schema";

// الگوبرداری دقیق از ماژول users/views/create/page.tsx
export default function CreateWorkspaceUserPage({
  back = true,
  after,
}: CreatePageProps) {
  // ۲. هوک useRole را برای دسترسی به متد getAll آن فراخوانی می‌کنیم
  const { getAll: getAllRoles } = useRole();

  return (
    <CreateWrapper
      // ۳. یک fetcher برای گرفتن لیست نقش‌ها تعریف می‌کنیم
      fetchers={[
        {
          key: "roles",
          fetcher: () =>
            getAllRoles({ page: 1, limit: 100 }).then((res) => res.data),
        },
      ]}
      title="دعوت عضو جدید"
      backUrl={back}
      // تابع after برای رفرش کردن لیست پس از ساخت موفق استفاده می‌شود
      after={after}
      // تمام پراپ‌های دیگر متناسب با ماژول workspace-users تنظیم شده‌اند
      formConfig={getCreateFormConfig}
      repo={new WorkspaceUserRepository()}
      schema={createWorkspaceUserSchema}
    />
  );
}
