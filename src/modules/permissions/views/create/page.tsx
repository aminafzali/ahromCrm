// مسیر فایل: src/modules/permissions/views/create/page.tsx

"use client";
import { CreateWrapper } from "@/@Client/Components/wrappers";
import { CreatePageProps } from "@/@Client/types/crud";
import { getPermissionFormConfig } from "../../data/form";
import { PermissionRepository } from "../../repo/PermissionRepository";

export default function CreatePermissionPage({
  back = true,
  after,
}: CreatePageProps) {
  return (
    <CreateWrapper
      title="دسترسی جدید"
      backUrl={back}
      after={after}
      formConfig={getPermissionFormConfig}
      repo={new PermissionRepository()}
    />
  );
}
