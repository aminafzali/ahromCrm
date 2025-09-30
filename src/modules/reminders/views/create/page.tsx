// مسیر فایل: src/modules/reminders/views/create/page.tsx

"use client";
import ReminderForm from "../../components/ReminderForm";

export default function ReminderCreatePage() {
  return (
    <div className="p-2">
      <div className="">
        <h4 className=" mb-0">ایجاد یادآور جدید</h4>
      </div>
      <div className="">
        <p className="text-muted mb-4">
          یک یادآور برای کاربر مورد نظر ایجاد کنید. در صورت تمایل می‌توانید آن
          را به یک درخواست یا فاکتور خاص نیز متصل نمایید.
        </p>

        <ReminderForm />
      </div>
    </div>
  );
}
