// src/modules/device-types/views/page.tsx

"use client";

import DataTableWrapper from "@/@Client/Components/wrappers/DataTableWrapper";
import { columnsForAdmin, listItemRender } from "../data/table";
import { useDeviceType } from "../hooks/useDeviceType";
import { DeviceTypeWithRelations } from "../types";

export default function IndexPage({ isAdmin = true, title = "انواع دستگاه" }) {
  // ما فقط به توابع و وضعیت‌های اصلی نیاز داریم
  const { getAll, loading, error, remove } = useDeviceType();

  return (
    <div>
      <DataTableWrapper<DeviceTypeWithRelations>
        columns={columnsForAdmin}
        createUrl="/dashboard/device-types/create"
        loading={loading}
        error={error}
        title={title}
        // تابع fetcher مستقیماً به کامپوننت پاس داده می‌شود
        fetcher={getAll}
        // تابع رندر برای نمای لیستی/کارتی
        listItemRender={listItemRender}
        listClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        // پراپرتی onDelete حذف شد زیرا DataTableWrapper آن را نمی‌پذیرد.
        // منطق حذف در کامپوننت ActionsTable مدیریت می‌شود.
      />
    </div>
  );
}
