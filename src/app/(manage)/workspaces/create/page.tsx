// مسیر فایل: src/app/(manage)/workspaces/create/page.tsx
"use client";
import WorkspaceForm from "../_components/WorkspaceForm";

export default function WorkspaceCreatePage() {
  return (
    <div className="card w-100" style={{ maxWidth: "700px" }}>
      <div className="card-header">
        <h4 className="card-title mb-0">ایجاد ورک‌اسپیس جدید</h4>
      </div>
      <div className="card-body p-4">
        <p className="text-muted mb-4">
          یک فضای کاری جدید بسازید. شما به عنوان مالک این ورک‌اسپیس شناخته
          خواهید شد.
        </p>
        <WorkspaceForm />
      </div>
    </div>
  );
}
