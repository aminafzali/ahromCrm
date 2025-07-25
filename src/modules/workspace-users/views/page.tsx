// مسیر فایل: src/modules/workspace-users/views/page.tsx
// (نسخه نهایی و اصلاح‌شده)

"use client";
import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
import { columnsForAdmin } from "../data/table";
import { WorkspaceUserRepository } from "../repo/WorkspaceUserRepository";

// الگوبرداری دقیق از ماژول brands/views/page.tsx
const WorkspaceUsersPage = () => {
  return (
    <IndexWrapper
      // پراپ hook به طور کامل حذف شد
      columns={columnsForAdmin}
      // فقط ریپازیتوری پاس داده می‌شود، دقیقاً مانند الگوی صحیح
      repo={new WorkspaceUserRepository()}
      title="اعضای ورک‌اسپیس"
    />
  );
};

export default WorkspaceUsersPage;
