// // مسیر فایل: src/modules/tasks/views/create/page.tsx
// مسیر فایل: src/modules/tasks/views/create/page.tsx

"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TaskForm from "../../components/TaskForm2";
import { useTask } from "../../hooks/useTask";

// پراپ‌های ورودی برای کامپوننت صفحه
interface CreateTaskPageProps {
  isAdmin?: boolean;
  backUrl?: boolean;
  backLabel?: string;
}

export default function CreateTaskPage({
  isAdmin = true, // به صورت پیش‌فرض در داشبورد ادمین هستیم
  backUrl = true,
  backLabel = "بازگشت به لیست وظایف",
}: CreateTaskPageProps) {
  const router = useRouter();
  // هوک ماژول وظایف برای دسترسی به توابع و state ها
  const { create, submitting, error } = useTask();

  const handleSubmit = async (data: any) => {
    try {
      // تابع create را فراخوانی کرده و منتظر نتیجه می‌مانیم
      const result: any = await create(data);

      // پس از ایجاد موفق، به صفحه جزئیات وظیفه جدید هدایت شو
      if (result?.data?.id) {
        const redirectUrl = isAdmin
          ? `/dashboard/tasks/${result.data.id}`
          : `/panel/tasks/${result.data.id}`;
        router.push(redirectUrl);
      } else {
        // اگر به هر دلیلی آیدی برنگشت، به لیست اصلی برگرد
        router.push(isAdmin ? "/dashboard/tasks" : "/panel/tasks");
      }
    } catch (err) {
      // خطا توسط هوک useTask مدیریت شده و در متغیر error قرار می‌گیرد
      // نیازی به toast جداگانه نیست
      console.error("Error creating task:", err);
    }
  };

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6">ایجاد وظیفه جدید</h1>

      {backUrl && (
        <Link
          href={isAdmin ? "/dashboard/tasks" : "/panel/tasks"}
          className="flex justify-start items-center mb-6"
        >
          <button className="btn btn-ghost">
            <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
            {backLabel}
          </button>
        </Link>
      )}

      {/* نمایش خطا در صورت وجود */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* استفاده از کامپوننت فرم اختصاصی که قبلا ساختیم */}
      <TaskForm onSubmit={handleSubmit} loading={submitting} />
    </div>
  );
}
