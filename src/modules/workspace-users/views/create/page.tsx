// مسیر فایل: src/modules/workspace-users/views/create/page.tsx

"use client";

import DIcon from "@/@Client/Components/common/DIcon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import WorkspaceUserForm from "../../components/WorkspaceUserForm";
import { useWorkspaceUser } from "../../hooks/useWorkspaceUser";

// الگوبرداری دقیق از received-devices/views/create/page.tsx
export default function CreateWorkspaceUserPage() {
  const router = useRouter();
  const { create, submitting, error } = useWorkspaceUser();

  const handleSubmit = async (data: any) => {
    try {
      await create(data);
      // پس از ساخت موفق، به صفحه لیست اعضا برمی‌گردیم
      router.push("/dashboard/workspace-users");
    } catch (err) {
      // خطا به صورت خودکار توسط هوک useCrud مدیریت و نمایش داده می‌شود
      console.error("Error creating workspace user:", err);
    }
  };

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6">دعوت عضو جدید به ورک‌اسپیس</h1>

      <Link
        href="/dashboard/workspace-users"
        className="flex justify-start items-center mb-6"
      >
        <button className="btn btn-ghost">
          <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
          بازگشت به لیست اعضا
        </button>
      </Link>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <WorkspaceUserForm onSubmit={handleSubmit} loading={submitting} />
    </div>
  );
}
