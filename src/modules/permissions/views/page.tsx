// مسیر فایل: src/modules/permissions/views/page.tsx

"use client";
import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
import { columnsForAdmin } from "../data/table";
import { usePermission } from "../hooks/usePermission";
import { PermissionRepository } from "../repo/PermissionRepository";

export default function IndexPage() {
  return (
    <IndexWrapper
    //  hook={usePermission()}
      repo={new PermissionRepository()}
      columns={columnsForAdmin}
      title="مدیریت دسترسی‌ها"
 //     createUrl="/dashboard/permissions/create"
    />
  );
}
