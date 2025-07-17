// مسیر فایل: src/modules/workspaces/views/page.tsx

"use client";

import DataTableWrapper from "@/@Client/Components/wrappers/DataTableWrapper";
import { columns } from "../data/table";
import { useWorkspaceCrud } from "../hooks/useWorkspaceCrud";
import { WorkspaceWithDetails } from "../types";

export default function WorkspacesModuleView() {
  const {
    getAll: fetchWorkspaces,
    remove: deleteItem,
    loading,
    error,
  } = useWorkspaceCrud();

  return (
    <DataTableWrapper<WorkspaceWithDetails>
      title="مدیریت ورک‌اسپیس‌ها"
      columns={columns}
      loading={loading}
      error={error}
      fetcher={fetchWorkspaces}
      //  deleteItem={deleteItem}
      createUrl="/dashboard/workspaces/create"
    />
  );
}
