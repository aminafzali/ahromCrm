// مسیر فایل: src/modules/reminders/views/create/page.tsx

"use client";

import ReminderForm from "../../components/ReminderForm";

export default function ReminderCreatePage() {
  return (
    <div className="card">
      <div className="card-header">
        <h4 className="card-title mb-0">ایجاد یادآور جدید</h4>
      </div>
      <div className="card-body">
        <ReminderForm />
      </div>
    </div>
  );
}
