// مسیر فایل: src/modules/roles/views/create/page.tsx

"use client";
import { CreateWrapper } from "@/@Client/Components/wrappers";
import { CreatePageProps } from "@/@Client/types/crud";
import { getCreateFormConfig } from "../../data/form";
import { RoleRepository } from "../../repo/RoleRepository";

export default function CreateRolePage({
  back = true,
  after,
}: CreatePageProps) {
  return (
    <CreateWrapper
      title="نقش جدید"
      backUrl={back}
      after={after}
      formConfig={getCreateFormConfig}
      repo={new RoleRepository()}
    />
  );
}
