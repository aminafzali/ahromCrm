// مسیر فایل: src/modules/workspaces/views/create/page.tsx

"use client";

import WorkspaceForm from "../../components/WorkspaceForm";

export default function WorkspaceCreatePage() {
  return (
    <div className="card">
      <div className="card-header">
        <h4 className="card-title mb-0">ایجاد ورک‌اسپیس جدید</h4>
      </div>
      <div className="card-body">
        <WorkspaceForm />
      </div>
    </div>
  );
}
