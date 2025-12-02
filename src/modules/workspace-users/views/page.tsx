// مسیر فایل: src/modules/workspace-users/views/page.tsx
// (نسخه نهایی و اصلاح‌شده)

"use client";
import Loading from "@/@Client/Components/common/Loading";
import IndexWrapper from "@/@Client/Components/wrappers/V2/IndexWrapper";
import { FilterOption } from "@/@Client/types";
import { useLabel } from "@/modules/labels/hooks/useLabel";
import { LabelWithRelations } from "@/modules/labels/types";
import { useUserGroup } from "@/modules/user-groups/hooks/useUserGroup";
import { UserGroupWithRelations } from "@/modules/user-groups/types";
import { useEffect, useMemo, useState } from "react";
import { columnsForAdmin } from "../data/table";
import { WorkspaceUserRepository } from "../repo/WorkspaceUserRepository";

const WorkspaceUsersPage = () => {
  // ۱. دریافت لیست برچسب‌ها و گروه‌ها
  const { getAll: getAllLabels, loading: loadingLabels } = useLabel();
  const { getAll: getAllGroups, loading: loadingGroups } = useUserGroup();

  const [labels, setLabels] = useState<LabelWithRelations[]>([]);
  const [groups, setGroups] = useState<UserGroupWithRelations[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const labelsData = await getAllLabels({
          limit: 1000,
          page: 1,
        });
        const groupsData = await getAllGroups({
          limit: 1000,
          page: 1,
        });
        setLabels(labelsData?.data || []);
        setGroups(groupsData?.data || []);
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };
    fetchData();
  }, []);

  // ۲. ساخت داینامیک فیلترها
  const filters: FilterOption[] = useMemo(() => {
    const newFilters: FilterOption[] = [];
    if (labels.length > 0) {
      newFilters.push({
        name: "labels_some", // نام فیلتر برای ارسال به بک‌اند
        label: "برچسب",
        options: [
          { value: "all", label: "همه" },
          ...labels.map((item) => ({
            value: String(item.id),
            label: item.name,
          })),
        ],
      });
    }

    if (groups.length > 0) {
      newFilters.push({
        name: "userGroupId", // تغییر از userGroups_some به userGroupId
        label: "گروه کاربری",
        options: [
          { value: "all", label: "همه" },
          ...groups.map((item) => ({
            value: String(item.id),
            label: item.name,
          })),
        ],
      });
    }
    return newFilters;
  }, [labels, groups]);

  // ۳. تعریف فیلتر تاریخ
  const dateFilters = useMemo(
    () => [{ name: "createdAt", label: "تاریخ ایجاد" }],
    []
  );

  if (loadingLabels || loadingGroups) return <Loading />;

  return (
    <IndexWrapper
      columns={columnsForAdmin}
      repo={new WorkspaceUserRepository()}
      title="اعضای ورک‌اسپیس"
      // ۴. ارسال فیلترها به کامپوننت
      filterOptions={filters}
      dateFilterFields={dateFilters}
    />
  );
};

export default WorkspaceUsersPage;

// // مسیر فایل: src/modules/workspace-users/views/page.tsx
// // (نسخه نهایی و اصلاح‌شده)

// "use client";
// import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
// import { columnsForAdmin } from "../data/table";
// import { WorkspaceUserRepository } from "../repo/WorkspaceUserRepository";

// // الگوبرداری دقیق از ماژول brands/views/page.tsx
// const WorkspaceUsersPage = () => {
//   return (
//     <IndexWrapper
//       // پراپ hook به طور کامل حذف شد
//       columns={columnsForAdmin}
//       // فقط ریپازیتوری پاس داده می‌شود، دقیقاً مانند الگوی صحیح
//       repo={new WorkspaceUserRepository()}
//       title="اعضای ورک‌اسپیس"
//     />
//   );
// };

// export default WorkspaceUsersPage;
