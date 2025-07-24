// مسیر فایل: src/modules/workspace-users/views/page.tsx

"use client";

import Loading from "@/@Client/Components/common/Loading";
import IndexWrapper from "@/@Client/Components/wrappers/IndexWrapper/Index";
import { FilterOption } from "@/@Client/types";
import { useRole } from "@/modules/roles/hooks/useRole"; // برای گرفتن لیست نقش‌ها
import { Role } from "@prisma/client";
import { useEffect, useState } from "react";
import { columnsForAdmin } from "../data/table";
import { WorkspaceUserRepository } from "../repo/WorkspaceUserRepository";

// الگوبرداری دقیق از received-devices/views/page.tsx
export default function WorkspaceUsersPage() {
  // ۱. واکشی داده‌های لازم برای فیلتر (لیست نقش‌ها)
  const { getAll: getAllRoles, loading: loadingRoles } = useRole();
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    const getFilterData = async () => {
      try {
        const rolesRes = await getAllRoles();
        setRoles(rolesRes?.data || []);
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };
    getFilterData();
  }, []); // آرایه وابستگی خالی است تا فقط یک بار اجرا شود

  // نمایش لودینگ تا زمانی که داده‌های فیلتر آماده شوند
  if (loadingRoles) {
    return <Loading />;
  }

  // ۲. ساخت آرایه فیلترها بر اساس داده‌های واکشی شده
  const filters: FilterOption[] = [];

  if (roles.length > 0) {
    filters.push({
      name: "roleId", // نام فیلتر باید با نام فیلد در دیتابیس مطابقت داشته باشد
      label: "نقش",
      options: [
        { value: "all", label: "همه نقش‌ها" },
        ...roles.map((item) => ({
          value: String(item.id),
          label: item.name,
        })),
      ],
    });
  }

  // ۳. رندر کردن IndexWrapper با پراپ‌های صحیح
  return (
    <IndexWrapper
      title="اعضای ورک‌اسپیس"
      columns={columnsForAdmin}
      // پراپ filterOptions را با فیلتر ساخته شده پاس می‌دهیم
      filterOptions={filters.length > 0 ? filters : undefined}
      // ریپازیتوری کلاینت این ماژول را برای واکشی داده‌های اصلی پاس می‌دهیم
      repo={new WorkspaceUserRepository()}
    />
  );
}
