// مسیر فایل: src/modules/roles/views/page.tsx

"use client";
import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
import { columnsForAdmin } from "../data/table";
import { useRole } from "../hooks/useRole";
import { RoleRepository } from "../repo/RoleRepository";

export default function IndexPage() {
  return (
    <IndexWrapper
   //   hook={useRole()}
      repo={new RoleRepository()}
      columns={columnsForAdmin}
      title="مدیریت نقش‌ها"
      //   createUrl="/dashboard/roles/create"
    />
  );
}
