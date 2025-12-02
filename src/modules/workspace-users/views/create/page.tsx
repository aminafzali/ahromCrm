// مسیر فایل: src/modules/workspace-users/views/create/page.tsx

"use client";

import { CreateWrapper } from "@/@Client/Components/wrappers";
import { CreatePageProps } from "@/@Client/types/crud";
import { useLabel } from "@/modules/labels/hooks/useLabel"; // ۱. هوک ماژول برچسب را ایمپورت می‌کنیم
import { useRole } from "@/modules/roles/hooks/useRole";
import { useUserGroup } from "@/modules/user-groups/hooks/useUserGroup";
import { getCreateFormConfig } from "../../data/form";
import { WorkspaceUserRepository } from "../../repo/WorkspaceUserRepository";
import { createWorkspaceUserSchema } from "../../validation/schema";

// الگوبرداری دقیق از ماژول products/views/create/page.tsx
export default function CreateWorkspaceUserPage({
  back = true,
  after,
}: CreatePageProps) {
  // ۳. هوک‌های مورد نیاز را برای دسترسی به متد getAll آن‌ها فراخوانی می‌کنیم
  const { getAll: getAllRoles } = useRole();
  const { getAll: getAllLabels } = useLabel();
  const { getAll: getAllUserGroups } = useUserGroup();

  return (
    <CreateWrapper
      // ۴. fetcher های صحیح را به لیست اضافه می‌کنیم
      fetchers={[
        {
          key: "roles",
          fetcher: () =>
            getAllRoles({ page: 1, limit: 100 }).then((res) => res?.data || []),
        },
        {
          key: "labels",
          fetcher: () =>
            getAllLabels({ page: 1, limit: 100 }).then(
              (res) => res?.data || []
            ),
        },
        {
          key: "userGroupId", // تغییر به one-to-one
          fetcher: () =>
            getAllUserGroups({ page: 1, limit: 100 }).then(
              (res) => res?.data || []
            ),
        },
      ]}
      title="دعوت عضو جدید"
      backUrl={back}
      after={after}
      formConfig={getCreateFormConfig}
      repo={new WorkspaceUserRepository()}
      schema={createWorkspaceUserSchema}
    />
  );
}
// "use client";

// import DIcon from "@/@Client/Components/common/DIcon";
// import { CreatePageProps } from "@/@Client/types/crud";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import WorkspaceUserForm from "../../components/WorkspaceUserForm";
// import { useWorkspaceUser } from "../../hooks/useWorkspaceUser";

// // الگوبرداری دقیق از received-devices/views/create/page.tsx
// export default function CreateWorkspaceUserPage({ after }: CreatePageProps) {
//   const router = useRouter();
//   const { create, submitting, error } = useWorkspaceUser();

//   const handleSubmit = async (data: any) => {
//     try {
//       await create(data);

//       if (after) {
//         // اگر تابع callback وجود داشت (مثلا برای بستن مودال و رفرش لیست)، آن را اجرا کن
//         after();
//       } else {
//         // در غیر این صورت، به صفحه لیست اعضا برگرد
//         router.push("/dashboard/workspace-users");
//       }
//     } catch (err) {
//       console.error("Error creating workspace user:", err);
//     }
//   };

//   return (
//     <div className="">
//       <h1 className="text-2xl font-bold mb-6">دعوت عضو جدید به ورک‌اسپیس</h1>

//       <Link
//         href="/dashboard/workspace-users"
//         className="flex justify-start items-center mb-6"
//       >
//         <button className="btn btn-ghost">
//           <DIcon icon="fa-arrow-right" cdi={false} classCustom="ml-2" />
//           بازگشت به لیست اعضا
//         </button>
//       </Link>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       <WorkspaceUserForm onSubmit={handleSubmit} loading={submitting} />
//     </div>
//   );
// }
